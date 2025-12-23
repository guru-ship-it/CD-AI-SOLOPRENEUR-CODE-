"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayKey = exports.waPhoneId = exports.waToken = exports.sendgridKey = exports.proteanBearerToken = exports.proteanApiKey = void 0;
const params_1 = require("firebase-functions/params");
exports.proteanApiKey = (0, params_1.defineSecret)("PROTEAN_API_KEY");
exports.proteanBearerToken = (0, params_1.defineSecret)("PROTEAN_BEARER_TOKEN");
exports.sendgridKey = (0, params_1.defineSecret)("SENDGRID_API_KEY");
exports.waToken = (0, params_1.defineSecret)("WHATSAPP_ACCESS_TOKEN");
exports.waPhoneId = (0, params_1.defineSecret)("WHATSAPP_PHONE_ID");
exports.razorpayKey = (0, params_1.defineSecret)("RAZORPAY_KEY");
//# sourceMappingURL=secrets.js.map