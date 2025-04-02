// tamagui.config.ts
import { createTamagui } from 'tamagui'

export default createTamagui({
  tokens: {
    color: {
      blue1: '#03045e',
      blue2: '#023e8a',
      blue3: '#0077b6',
      blue4: '#00b4d8',
      blue5: '#90e0ef',
      white: '#ffffff',
      black: '#000000',
    },
    space: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    radius: {
      sm: 4,
      md: 8,
      lg: 16,
      full: 9999,
    },
  },
  themes: {
    light: {
      background: '$white',
      color: '$black',
    },
    dark: {
      background: '$black',
      color: '$white',
    },
  },
  defaultTheme: 'light',
})