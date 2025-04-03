import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import LottieView from 'lottie-react-native';
import { Image } from 'react-native'; 
import { doc, updateDoc } from "firebase/firestore";
import { firestore, auth } from "../firebaseconfig"; 
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const slides = [
    {
        key: '1',
        title: 'Welcome to Care!',
        image: require('../assets/robot.png'),
        description: 'Click next for Onboarding',
      },
  {
    key: '4',
    title: 'Stay Safe',
    animation: require('../assets/animations/safety.json'),
    description: 'Report and share safety information with your community.',
  },
  {
    key: '2',
    title: 'Find Safe Routes',
    animation: require('../assets/animations/map.json'),
    description: 'Use real-time data to navigate the safest paths.',
  },
  {
    key: '3',
    title: 'Virtual Assistance',
    animation: require('../assets/animations/ai.json'),
    description: 'Get AI support in dangerous situations.',
  },
  {
    key: '5',
    title: 'Emergency Support',
    animation: require('../assets/animations/emergency.json'),
    description: 'Trigger emergency support using voice commands.',
    type: 'animation',
  },
  {
  key: '6',
  title: 'Welcome',
  animation: require('../assets/animations/celebration.json'),
  description: 'Ready to up your safety game? Let\'s go!',
},
];

export default function Onboarding() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
  
    const handleNext = () => {
      if (currentIndex < slides.length - 1) {
        flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        setCurrentIndex((prev) => prev + 1);
      }
    };
  
    const handlePrev = () => {
      if (currentIndex > 0) {
        flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
        setCurrentIndex((prev) => prev - 1);
      }
    };

    const handleDone = async () => {
        const user = auth.currentUser;
        if (user) {
          await updateDoc(doc(firestore, "users", user.uid), {
            onboardingCompleted: true,
          });
        }
      
        router.replace("/Home");
      };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B141E' }}>
      <FlatList
        data={slides}
        ref={flatListRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={({ item }) => (
            <View style={styles.slide}>
            {item.animation ? (
              <LottieView source={item.animation} autoPlay loop style={styles.animation} />
            ) : item.image ? (
              <Image source={item.image} style={styles.image} resizeMode="contain" />
            ) : null}
        
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
        keyExtractor={(item) => item.key}
      />

      <View style={styles.controls}>
        {currentIndex > 0 && (
          <TouchableOpacity onPress={handlePrev} style={styles.controlBtn}>
            <Text style={styles.controlText}>Previous</Text>
          </TouchableOpacity>
        )}

        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity onPress={handleNext} style={styles.controlBtn}>
            <Text style={styles.controlText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
            <Text style={styles.doneText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  animation: {
    width: 300,
    height: 300,
  },
  title: {
    color: '#00FFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    fontFamily: 'Poppins',
  },
  description: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  controlBtn: {
    padding: 12,
    borderColor: '#00FFFF',
    borderWidth: 1,
    borderRadius: 8,
  },
  controlText: {
    color: '#00FFFF',
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#00FFFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignSelf: 'center',
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  doneText: {
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    fontSize: 16,
  },
});
