import { defineSecret } from "firebase-functions/params";

// Identity Gateway Secrets
export const proteanApiKey = defineSecret("PROTEAN_API_KEY");
export const proteanBearerToken = defineSecret("PROTEAN_BEARER_TOKEN");

// Notification Secrets
export const sendgridKey = defineSecret("SENDGRID_API_KEY");
export const waToken = defineSecret("WHATSAPP_ACCESS_TOKEN");
export const waPhoneId = defineSecret("WHATSAPP_PHONE_ID");
