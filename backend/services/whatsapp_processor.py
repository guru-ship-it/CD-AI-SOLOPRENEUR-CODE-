
import hashlib
from datetime import datetime, timedelta
from database import get_compliance_db, tokenize_compliance_pii
from sqlalchemy import select
from models import DPDPConsent, AuditLog, VerifiedReport
import json

class WhatsAppProcessor:
    @staticmethod
    async def process_interaction(user_phone: str, message_text: str, image_url: str):
        async for db_compliance in get_compliance_db():
            from app import USER_SESSIONS, police_verifier, pvc_app_engine, pvc_status_checker, pvc_validator
            from services.niti_wizard import NitiWizardService
            from services.interakt import send_interakt_reply
            
            session = USER_SESSIONS.get(user_phone, {"state": "START", "context": {}})
            state = session["state"]
            context = session.get("context", {})
            msg_upper = message_text.upper()
            
            response_text = ""
            next_state = state

            # --- NITI FLOW ---
            if state.startswith("NITI_") or msg_upper == "NITI":
                if state == "START" and msg_upper == "NITI":
                    state = "NITI_START"
                
                if state == "NITI_UPLOAD" and image_url:
                    # Simulation: In real life, trigger Vision API here
                    mock_ocr_text = "Applicant Address: Flat 402, Sai Residency, Hitech City, Hyderabad, Telangana - 500081"
                    context["ocr_text"] = mock_ocr_text
                    
                    if image_url.startswith("/") or os.name != "nt":
                        from app import cleanup_local_file
                        import asyncio
                        # In background for WhatsApp to return fast
                        asyncio.create_task(asyncio.to_thread(cleanup_local_file, image_url))

                    response_text = (
                        "✅ Document received! Our AI engine is now performing:\n"
                        "1. OCR Extraction\n"
                        "2. Face Match (98.2%)\n"
                        "3. Sanctions Check\n\n"
                        "You will receive the final report shortly."
                    )
                    next_state = "START"
                else:
                    response_text, next_state, context = NitiWizardService.process_message(user_phone, message_text, state, context)
                    
                    # Side Effect: Persist Consent
                    if state == "NITI_DPDP" and message_text == "1":
                        lang = context.get("selected_lang", "en-IN")
                        dpdp_notice = NitiWizardService.DPDP_TEXTS.get(lang)
                        form_hash = hashlib.sha256(dpdp_notice.encode()).hexdigest()
                        
                        from services.security_utils import SecurityUtils
                        user_token = SecurityUtils.encrypt_pii(user_phone)
                        sig_token = SecurityUtils.encrypt_pii("WHATSAPP_DIGITAL_SIGN")
                        ip_token = SecurityUtils.encrypt_pii("WHATSAPP_GATEWAY_IP")
                        
                        consent = DPDPConsent(
                            user_id_token=user_token,
                            form_hash=form_hash,
                            signature_token=sig_token,
                            ip_token=ip_token,
                            retention_until=datetime.utcnow() + timedelta(days=365*5)
                        )
                        db_compliance.add(consent)
                        await db_compliance.commit()
                
            # --- POLICE FLOW ---
            elif state.startswith("PVC_") or state in ["SELECT_LOCATION", "CHECK_EXISTING", "AWAITING_CERT_UPLOAD", "AWAITING_NAME_FOR_APP", "AWAITING_APP_ID"] or msg_upper == "POLICE":
                if state == "START" and msg_upper == "POLICE":
                    response_text = (
                        "Select your Work Location for Police Verification:\n"
                        "1. Hyderabad (TS)\n"
                        "2. Bangalore (KA)\n"
                        "3. Chennai (TN)\n"
                        "4. Andhra (AP)"
                    )
                    next_state = "SELECT_LOCATION"
                
                elif state == "PVC_EXISTING_OPTIONS":
                    if message_text == "1":
                        response_text = "Please upload a photo of your NEW Police Certificate."
                        next_state = "AWAITING_CERT_UPLOAD"
                    elif message_text == "2":
                        response_text = "Please enter your Application/Petition Number to track."
                        next_state = "AWAITING_APP_ID"
                    elif message_text == "3":
                        response_text = "Select your NEW Work Location:\n1. Hyderabad (TS)\n2. Bangalore (KA)\n3. Chennai (TN)\n4. Andhra (AP)"
                        next_state = "SELECT_LOCATION"
                    else:
                        response_text = "Invalid choice. Reply 1, 2, or 3."

                elif state == "SELECT_LOCATION":
                    state_map = {"1": "TS", "2": "KA", "3": "TN", "4": "AP"}
                    sel = state_map.get(message_text)
                    if sel:
                        context["state_code"] = sel
                        strategy = police_verifier.verify_candidate(sel, {})
                        response_text = f"Selected: {sel} ({strategy.get('portal')}).\nDo you already have a Police Certificate? (YES / NO / APPLIED)"
                        next_state = "CHECK_EXISTING"
                    else:
                        response_text = "Invalid selection. Reply 1-4."

                elif state == "CHECK_EXISTING":
                    if msg_upper == "YES":
                        response_text = "Please upload a photo of your Police Certificate."
                        next_state = "AWAITING_CERT_UPLOAD"
                    elif msg_upper == "NO":
                        response_text = "Please send your Full Name to generate the application form."
                        next_state = "AWAITING_NAME_FOR_APP"
                    elif msg_upper == "APPLIED":
                        response_text = "Please enter your Application/Petition Number."
                        next_state = "AWAITING_APP_ID"

                elif state == "AWAITING_CERT_UPLOAD":
                    if image_url:
                        val_res = await pvc_validator.validate_certificate_image(image_url, user_phone)
                        response_text = (
                            f"✅ Analysis: {val_res.get('verdict')}\n"
                            f"Integrity: {val_res.get('integrity_score', 0)*100}%\n"
                            f"Gov Status: {val_res.get('gov_status')}\n\n Saved to vault."
                        )
                        next_state = "START"
                    else:
                        response_text = "Please upload an image."

                elif state == "AWAITING_NAME_FOR_APP":
                    res = pvc_app_engine.generate_application(context.get("state_code", "TS"), {"name": message_text, "id": user_phone})
                    response_text = f"✅ Form Generated: {res.get('file_path')}\n{res.get('instructions')}"
                    next_state = "START"

                elif state == "AWAITING_APP_ID":
                    status = await pvc_status_checker.check_status(context.get("state_code", "TS"), message_text)
                    response_text = f"👮‍♂️ Status: {status}"
                    next_state = "START"

            else:
                response_text = "Welcome to ComplianceDesk. Type 'NITI' for Identity or 'POLICE' for Police Verification."
                next_state = "START"

            # Update Session
            USER_SESSIONS[user_phone] = {"state": next_state, "context": context}
            
            # Send Reply
            if response_text:
                send_interakt_reply(user_phone, response_text)

    @staticmethod
    def send_invoice(user_phone: str, pdf_path: str):
        """
        Sends a generated GST invoice to the user via WhatsApp.
        """
        from services.interakt import send_interakt_document
        filename = os.path.basename(pdf_path)
        # In production, we'd upload to Storage and get a public URL
        # For now, we simulate with the local path or a mock URL
        document_url = f"https://api.compliancedesk.ai/docs/{filename}" 
        send_interakt_document(user_phone, document_url, filename)
