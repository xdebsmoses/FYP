"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var twilio = require("twilio");
require("dotenv").config();
var app = express();
app.use(cors());
app.use(express.json());
var client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// ✅ Helper to format numbers
var formatPhoneNumber = function (phone) {
    if (!phone)
        return "";
    var trimmed = phone.trim();
    if (trimmed.startsWith("+"))
        return trimmed;
    if (trimmed.startsWith("0"))
        return "+44".concat(trimmed.slice(1));
    return trimmed;
};

// ✅ Correct POST route
app.post("/send-alert", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, contacts, message, results, _i, contacts_1, contact, formatted, response, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, contacts = _a.contacts, message = _a.message;
                if (!contacts || contacts.length === 0 || !message) {
                    return [2 /*return*/, res.status(400).json({ error: "Missing contacts or message" })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 6, , 7]);
                results = [];
                _i = 0, contacts_1 = contacts;
                _b.label = 2;
            case 2:
                if (!(_i < contacts_1.length)) return [3 /*break*/, 5];
                contact = contacts_1[_i];
                formatted = formatPhoneNumber(contact.phone);
                console.log("📞 Sending to:", formatted);
                return [4 /*yield*/, client.messages.create({
                        body: message,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: formatted,
                    })];
            case 3:
                response = _b.sent();
                results.push({
                    to: formatted,
                    sid: response.sid,
                    status: response.status,
                });
                _b.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, res.status(200).json({ success: true, results: results })];
            case 6:
                error_2 = _b.sent();
                console.error("❌ Twilio SMS failed:", error_2.message);
                return [2 /*return*/, res.status(500).json({
                        error: "Failed to send SMS",
                        details: {
                            status: error_2.status,
                            code: error_2.code,
                            message: error_2.message,
                            moreInfo: error_2.moreInfo,
                        },
                    })];
            case 7: return [2 /*return*/];
        }
    });
}); });
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("\uD83D\uDE80 CARE backend running on http://10.76.71.143:".concat(PORT));
});
