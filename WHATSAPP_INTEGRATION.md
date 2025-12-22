# WhatsApp Integration

## 1. Webhook
- **Path**: `functions/src/whatsapp.ts`
- **Verification**: Meta Cloud API Handshake.
- **Routing**: Detect message type (Text or Image).

## 2. Vision Connector
- **Trigger**: Incoming Image/Document.
- **Service**: Google Cloud Vision API.
- **Goal**: Extract text (Aadhaar/PAN) and metadata.
- **Flow**: WhatsApp Message -> Cloud Function -> Vision AI -> Verifier Service -> User Response.

## 3. Niti Logic
- **Persona**:
  - Name: Niti
  - Role: Compliance AI for CDC AI.
  - Tone: Professional, Polite, Helpful.
  - Greeting: "Namaste"
  - Language: English/Hinglish support.
- **Response Types**:
  - Greeting/General Queries: GEMINI 1.5 FLASH.
  - Image Uploads: Confirmation of forensic check.
  - Final Verification: Direct status update.
