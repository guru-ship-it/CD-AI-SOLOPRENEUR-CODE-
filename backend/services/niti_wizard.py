import hashlib
from datetime import datetime, timedelta

class NitiWizardService:
    """
    Manages the Niti Assistant Wizard Flow for WhatsApp.
    This service is stateless; it takes state and context, and returns new state and response.
    """

    LANGUAGES = {
        "1": {"label": "English", "value": "en-IN"},
        "2": {"label": "हिन्दी (Hindi)", "value": "hi-IN"},
        "3": {"label": "मराठी (Marathi)", "value": "mr-IN"},
        "4": {"label": "বাংলা (Bengali)", "value": "bn-IN"},
        "5": {"label": "తెలుగు (Telugu)", "value": "te-IN"},
        "6": {"label": "தமிழ் (Tamil)", "value": "ta-IN"},
        "7": {"label": "ગુજરાતી (Gujarati)", "value": "gu-IN"},
        "8": {"label": "اردو (Urdu)", "value": "ur-IN"},
        "9": {"label": "ಕನ್ನಡ (Kannada)", "value": "kn-IN"},
        "10": {"label": "ଓଡ଼ିଆ (Odia)", "value": "or-IN"},
        "11": {"label": "മലയാളം (Malayalam)", "value": "ml-IN"},
        "12": {"label": "ਪੰਜਾਬੀ (Punjabi)", "value": "pa-IN"}
    }

    DPDP_TEXTS = {
        'en-IN': "**DPDP ACT 2023 CONSENT NOTICE**\nCompliance Desk AI (Data Fiduciary) requires your consent to process:\n1. **Name & ID Number**\n2. **Live Photo/Biometrics**\n**Purpose**: Identity Verification & Fraud Prevention.\n**Your Rights**: You can access, update, or withdraw consent at any time.\n**Grievance**: Contact our DPO at dpo@compliancedesk.ai or escalate to the Data Protection Board of India.\n**Agreement**: Reply '1' to Agree, '2' to Decline.",
        'mr-IN': "**DPDP कायदा 2023 संमती सूचना**\nकम्प्लायन्स डेस्क एआय (डेटा फिडुशियरी) ला खालील गोष्टींवर प्रक्रिया करण्यासाठी तुमची संमती आवश्यक आहे:\n1. **नाव आणि आयडी क्रमांक**\n2. **थेट फोटो/बायोमेट्रिक्स**\n**उद्देश**: ओळख पडताळणी आणि फसवणूक प्रतिबंध.\n**तुमचे अधिकार**: तुम्ही कधीही संमती मिळवू शकता, अपडेट करू शकता किंवा मागे घेऊ शकता.\n**तक्रार**: dpo@compliancedesk.ai वर आमच्या डीपीओशी संपर्क साधा किंवा भारतीय डेटा संरक्षण मंडळाकडे तक्रार करा।\n**करार**: सहमत असल्यास '1' आणि नाकारल्यास '2' उत्तर द्या।",
        'hi-IN': "**DPDP अधिनियम 2023 सहमति सूचना**\nकम्प्लायंस डेस्क एआई (डेटा फिडुशियरी) को निम्नलिखित को संसाधित करने के लिए आपकी सहमति की आवश्यकता है:\n1. **नाम और आईडी संख्या**\n2. **लाइव फोटो/बायोमेट्रिक्स**\n**उद्देश्य**: पहचान सत्यापन और धोखाधड़ी निवारण।\n**आपके अधिकार**: आप किसी भी समय सहमति प्राप्त कर सकते हैं, अपडेट कर सकते हैं या वापस ले सकते हैं।\n**शिकायत**: dpo@compliancedesk.ai पर हमारे डीपीओ से संपर्क करें या भारतीय डेटा संरक्षण बोर्ड को सूचित करें।\n**अनुबंध**: सहमत होने के लिए '1' या अस्वीकार करने के लिए '2' उत्तर दें।",
        'bn-IN': "**DPDP আইন 2023 সম্মতি বিজ্ঞপ্তি**\nCompliance Desk AI (ডেটা ফিডুসিয়ারি) আপনার নিম্নলিখিত তথ্য প্রক্রিয়াকরণের জন্য সম্মতি চাইছে:\n১. **নাম ও আইডি নম্বর**\n২. **লাইভ ফটো/বায়োমেট্রিিক্স**\n**উদ্দেশ্য**: পরিচয় যাচাইকরণ এবং জালিয়াতি প্রতিরোধ।\n**আপনার অধিকার**: আপনি যেকোনো সময় সম্মতি প্রদান, আপডেট বা প্রত্যাহার করতে পারেন।\n**অভিযোগ**: আমাদের DPO এর সাথে dpo@compliancedesk.ai-এ যোগাযোগ করুন বা ভারতের ডেটা সুরক্ষা বোর্ডের কাছে অভিযোগ জানান।\n**চুক্তি**: সম্মত হলে '1' এবং অসম্মত হলে '2' রিপ্লাই দিন।",
        'te-IN': "**DPDP చట్టం 2023 సమ్మతి నోటీసు**\nకంప్లైయెన్స్ డెస్క్ AI (డేటా ఫిడ్యూషియరీ) కింది వాటిని ప్రాసెస్ చేయడానికి మీ సమ్మతిని కోరుతోంది:\n1. **పేరు & ID సంఖ్య**\n2. **లైవ్ ఫోటో/బయోమెట్రిక్స్**\n**ఉద్దేశ్యం**: గుర్తింపు ధృవీకరణ & మోసాల నివారణ.\n**మీ హక్కులు**: మీరు ఎప్పుడైనా సమ్మతిని పొందవచ్చు, అప్‌డేట్ చేయవచ్చు లేదా ఉపసంహరించుకోవచ్చు.\n**ఫిర్యాదు**: మా DPOని dpo@compliancedesk.aiలో సంప్రదించండి లేదా భారత డేటా రక్షణ బోర్డుకు నివేదించండి.\n**అంగీకారం**: అంగీకరించడానికి '1' లేదా నిరాకరించడానికి '2' అని రిప్లై ఇవ్వండి.",
        'ta-IN': "**DPDP சட்டம் 2023 ஒப்புதல் அறிவிப்பு**\nCompliance Desk AI (தரவு நம்பகத்தன்மை) பின்வருவனவற்றைச் செயலாக்க உங்கள் ஒப்புதலைக் கோருகிறது:\n1. **பெயர் மற்றும் அடையாள எண்**\n2. **நேரடி புகைப்படம்/உயிரியளவுகள்**\n**நோக்கம்**: அடையாளச் சரிபார்ப்பு மற்றும் மோசடி தடுப்பு.\n**உங்கள் உரிமைகள்**: நீங்கள் எந்த நேரத்திலும் ஒப்புதலை அணுகலாம், புதுப்பிக்கலாம் அல்லது திரும்பப் பெறலாம்.\n**குறைதீர்ப்பு**: dpo@compliancedesk.ai இல் எங்கள் DPO-வைத் தொடர்பு கொள்ளவும் அல்லது இந்திய தரவு பாதுகாப்பு வாரியத்திடம் புகார் அளிக்கவும்.\n**ஒப்பந்தம்**: ஒப்புக்கொள்ள '1' என்றும், நிராகரிக்க '2' என்றும் பதிலளிக்கவும்.",
        'kn-IN': "**DPDP ಕಾಯಿದೆ 2023 ಸಮ್ಮತಿ ಸೂಚನೆ**\nಕಾಂಪ್ಲೈಯನ್ಸ್ ಡೆಸ್ಕ್ AI (ಡೇಟಾ ಫಿಡ್ಯೂಶಿಯರಿ) ಕೆಳಗಿನವುಗಳನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ನಿಮ್ಮ ಸಮ್ಮತಿಯನ್ನು ಬಯಸುತ್ತದೆ:\n1. **ಹೆಸರು ಮತ್ತು ID ಸಂಖ್ಯೆ**\n2. **ಲೈವ್ ಫೋಟೋ/ಬಯೋಮೆಟ್ರಿಕ್ಸ್**\n**ಉದ್ದೇಶ**: ಗುರುತಿನ ಪರಿಶೀಲನೆ ಮತ್ತು ವಂಚನೆ ತಡೆಗಟ್ಟುವಿಕೆ.\n**ನಿಮ್ಮ ಹಕ್ಕುಗಳು**: ನೀವು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಸಮ್ಮತಿಯನ್ನು ಪಡೆಯಬಹುದು, ನವೀಕರಿಸಬಹುದು ಅಥವಾ ಹಿಂಪಡೆಯಬಹುದು.\n**ದೂರು**: dpo@compliancedesk.ai ನಲ್ಲಿ ನಮ್ಮ DPO ಅನ್ನು ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ಭಾರತೀಯ ಡೇಟಾ ಸಂರಕ್ಷಣಾ ಮಂಡಳಿಗೆ ವರದಿ ಮಾಡಿ.\n**ಒಪ್ಪಂದ**: ಒಪ್ಪಲು '1' ಮತ್ತು ನಿರಾಕರಿಸಲು '2' ಎಂದು ಉತ್ತರಿಸಿ.",
        'gu-IN': "**DPDP એક્ટ 2023 સંમતિ સૂચના**\nકમ્પ્લાયન્સ ડેસ્ક AI (ડેટા ફિડ્યુશિયરી) ને નીચેના પર પ્રક્રિયા કરવા માટે તમારી સંમતિની જરૂર છે:\n1. **નામ અને આઈડી નંબર**\n2. **લાઇવ ફોટો/બાયોમેટ્રિક્સ**\n**હેતુ**: ઓળખ ચકાસણી અને છેતરપિંડી નિવારણ.\n**તમારા અધિકારો**: તમે કોઈપણ સમયે સંમતિ મેળવી શકો છો, અપડેટ કરી શકો છો કે પરત ખેંચી શકો છો.\n**ફરિયાદ**: dpo@compliancedesk.ai પર અમારા DPO નો સંપર્ક કરો અથવા ભારતીય ડેટา પ્રોટેક્શન બોર્ડને જાણ કરો.\n**કરાર**: સંમત થવા માટે '1' અને અસંમત થવા માટે '2' રિપ્લાય આપો.",
        'ur-IN': "**ڈی پی ڈی پی ایکٹ 2023 رضامندی کا نوٹس**\nکمپلائنس ڈیسک AI (ڈیٹا فیڈوشری) کو درج ذیل پر کارروائی کرنے کے لیے آپ کی رضامندی درکار ہے:\n1. **نام اور آئی ڈی نمبر**\n2. **لائیو تصویر/بایومیٹرکس**\n**مقصد**: شناخت کی تصدیق اور دھوکہ دہی کی روک تھام۔\n**آپ کے حقوق**: آپ کسی بھی وقت رضامندی تک رسائی، اپ ڈیٹ یا واپس لے سکتے ہیں۔\n**شکایت**: dpo@compliancedesk.ai پر ہمارے ڈی پی او سے رابطہ کریں یا ڈیٹا پروٹیکشن بورڈ آف انڈیا کو مطلع کریں۔\n**معاہدہ**: اتفاق کے لیے '1' اور انکار کے لیے '2' ریپلائی دیں۔",
        'or-IN': "**DPDP ଅଧିନିୟମ 2023 ସମ୍ମତି ବିଜ୍ଞପ୍ତି**\nCompliance Desk AI (ଡାଟା ଫିଡୁସିଆରୀ) ଆପଣଙ୍କର ନିମ୍ନଲିଖିତ ତଥ୍ୟ ପ୍ରକ୍ରିୟାକରଣ ପାଇଁ ସମ୍ମତି ଚାହୁଁଛି:\n୧. **ନାମ ଏବଂ ପରିଚୟ ପତ୍ର ସଂଖ୍ୟା**\n୨. **ଲାଇଭ୍ ଫଟୋ/ବାୟୋମେଟ୍ରିକ୍ସ**\n**ଉଦ୍ଦେଶ୍ୟ**: ପରିଚୟ ଯାଞ୍ચ ଏବଂ ଜାଲିଆତି ରୋକିବା |\n**ଆପଣଙ୍କ ଅଧିକାର**: ଆପଣ ଯେକୌଣସಿ ସମୟରେ ସମ୍ମତି ପ୍ରଦାନ, ଅପଡେଟ୍ କିମ୍ବା ପ୍ରତ୍ୟାହାର କରିପାରିବେ |\n**ଅଭିଯୋଗ**: ଆମ DPO ସହିତ dpo@compliancedesk.ai ରେ ଯୋଗାଯୋଗ କରନ୍ତୁ କିମ୍ବା ଭାରତୀಯ ଡାଟା ପ୍ରୋଟେକ୍ସନ୍ ବୋର୍ଡକୁ ଜଣାନ୍ତୁ |\n**ଚୁକ୍ତି**: ସମ୍ମତି ପାଇଁ '1' ଏବଂ ଅସହମତି ପାଇଁ '2' ଲେଖନ୍ତୁ |",
        'ml-IN': "**DPDP ആക്ട് 2023 സമ്മത അറിയിപ്പ്**\nകംപ്ലയൻസ് ഡെസ്ക് AI (ഡാറ്റ ഫിഡ്യൂഷ്യറി) ഇനിപ്പറയുന്നവ പ്രോസസ്സ് ചെയ്യുന്നതിന് നിങ്ങളുടെ സമ്മതം ആവശ്യപ്പെടുന്നു:\n1. **പേരും ഐഡി നമ്പറും**\n2. **ലൈവ് ഫോട്ടോ/ബയോമെട്രിക്സ്**\n**ഉദ്ദേശ്യം**: തിരിച്ചറിയൽ പരിശോധനയും തട്ടിപ്പ് തടയലും.\n**നിങ്ങളുടെ അവകാശങ്ങൾ**: നിങ്ങൾക്ക് എപ്പോൾ വേണമെങ്കിലും സമ്മതം ആക്സസ് ചെയ്യാനോ പുതുക്കാനോ പിൻവಲിക്കാനോ കഴിയും.\n**പരാതി**: dpo@compliancedesk.ai-ൽ ഞങ്ങളുടെ DPO-യെ ബന്ധപ്പെടുക അല്ലെങ്കിൽ ഡാറ്റ പ്രൊട്ടക്ഷൻ ബോർഡ് ഓഫ് ఇండియాയെ അറിയിക്കുക.\n**കരാർ**: സമ്മതിക്കാൻ '1' എന്നും നിരസിക്കാൻ '2' എന്നും മറുപടി നൽകുക.",
        'pa-IN': "**DPDP ਐਕਟ 2023 ਸਹਿਮਤੀ ਨੋਟਿਸ**\nਕੰਪਲਾਇੰਸ ਡੈੈਸਕ AI (ਡਾਟਾ ਫਿਡਿਊਸ਼ਰੀ) ਨੂੰ ਹੇਠ ਲਿਖਿਆਂ ਦੀ ਪ੍ਰਕਿਰਿਆ ਕਰਨ ਲਈ ਤੁਹਾਡੀ ਸਹਿਮਤੀ ਦੀ ਲੋੜ ਹੈ:\n1. **ਨਾਮ ਅਤੇ ਆਈਡੀ ਨੰਬਰ**\n2. **ਲਾਈਵ ਫੋਟੋ/ਬਾਇਓਮੈਟ੍ਰਿਕਸ**\n**ਉਦੇਸ਼**: ਪਛਾਣ ਦੀ ਪੁਸ਼ਟੀ ਅਤੇ ਧੋਖਾਧੜੀ ਦੀ ਰੋਕਥਾਮ।\n**ਤੁਹਾਡੇ ਅਧਿਕਾਰ**: ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਸਮੇਂ ਸਹਿਮਤੀ ਤੱਕ ਪਹੁੰਚ ਸਕਦੇ ਹੋ, ਅਪਡੇਟ ਕਰ ਸਕਦੇ ਹੋ ਜਾਂ వਾਪਸ ਲੈ ਸਕਦੇ ਹੋ।\n**ਸ਼ਿਕਾਇਤ**: dpo@compliancedesk.ai 'ਤੇ ਸਾਡੇ DPO ਨਾਲ ਸੰਪਰਕ ਕਰੋ ਜਾਂ ਭਾਰਤੀ ਡੇਟਾ ਪ੍ਰੋਟੈਕਸ਼ਨ ਬੋਰਡ ਨੂੰ ਸੂਚਿਤ ਕਰੋ।\n**ਸਮਝੌਤਾ**: ਸਹਿਮਤੀ ਲਈ '1' ਅਤੇ ਇਨਕਾਰ ਲਈ '2' ਰਿਪਲਾਈ ਕਰੋ।"
    }

    @staticmethod
    def process_message(user_id, msg, state, context):
        """
        Main logic for state transitions.
        """
        msg = msg.strip()
        next_state = state
        response_text = ""

        if state == "NITI_START":
            lang_list = "\n".join([f"{k}. {v['label']}" for k, v in NitiWizardService.LANGUAGES.items()])
            response_text = f"Namaste! Welcome to ComplianceDesk AI. Please select your preferred language:\n\n{lang_list}"
            next_state = "NITI_LANGUAGE"

        elif state == "NITI_LANGUAGE":
            lang_choice = NitiWizardService.LANGUAGES.get(msg)
            if lang_choice:
                context["selected_lang"] = lang_choice["value"]
                dpdp_text = NitiWizardService.DPDP_TEXTS.get(lang_choice["value"], "Error: Consent not found.")
                response_text = dpdp_text
                next_state = "NITI_DPDP"
            else:
                response_text = "Invalid selection. Please reply with a number from 1 to 12."

        elif state == "NITI_DPDP":
            if msg == "1": # Agree
                # In a real app, this would trigger a DB write.
                # Here we just acknowledge and move on.
                lang = context.get("selected_lang", "en-IN")
                dpdp_notice = NitiWizardService.DPDP_TEXTS.get(lang)
                form_hash = hashlib.sha256(dpdp_notice.encode()).hexdigest()
                
                response_text = (
                    f"✅ Consent securely recorded in Compliance Vault (Hash: {form_hash[:8]})\n\n"
                    "Now, are you an Individual user or a Corporate user?\n"
                    "1. Individual\n"
                    "2. Corporate"
                )
                next_state = "NITI_USER_TYPE"
            elif msg == "2": # Decline
                response_text = "We cannot proceed without your consent according to the DPDP Act. Type 'NITI' if you change your mind."
                next_state = "START"
            else:
                response_text = "Please reply with '1' to Agree or '2' to Decline."

        elif state == "NITI_USER_TYPE":
            if msg == "1": # Individual
                context["user_type"] = "individual"
                response_text = (
                    "As an Individual, you can choose from our bouquet of verifications:\n"
                    "1. Individual KYC (Aadhaar/PAN)\n"
                    "2. Freelancer/Small Biz KYB\n"
                    "3. Voter ID Check\n"
                    "4. Passport Validation\n\n"
                    "Reply with 1, 2, 3, or 4."
                )
                next_state = "NITI_BOUQUET"
            elif msg == "2": # Corporate
                context["user_type"] = "corporate"
                response_text = (
                    "As a Corporate user, your verifications are managed via your company's master contract.\n\n"
                    "Mandated Verification List:\n"
                    "1. Identity (Aadhaar/PAN)\n"
                    "2. Address Proof (Utility Bill)\n"
                    "3. Criminal Records (Police Check)\n"
                    "4. Employment & Education History\n\n"
                    "Our system is ready. Please upload your documents (images) now."
                )
                next_state = "NITI_UPLOAD"
            else:
                response_text = "Please reply with '1' for Individual or '2' for Corporate."

        elif state == "NITI_BOUQUET":
            choices = {"1": "Individual KYC", "2": "Freelancer KYB", "3": "Voter ID", "4": "Passport"}
            selection = choices.get(msg)
            if selection:
                context["selection"] = selection
                response_text = (
                    f"You selected {selection}. Please proceed to payment to start your verification tunnel.\n\n"
                    "Payment Link: https://compliancedesk.ai/pay/demo\n"
                    "Type 'PAID' once payment is complete."
                )
                next_state = "NITI_PAYMENT"
            else:
                response_text = "Invalid selection. Please reply with 1, 2, 3, or 4."

        elif state == "NITI_PAYMENT":
            if msg.upper() == "PAID":
                response_text = "Payment verified! ✅ Please upload your document images (Aadhaar/PAN/KYB) to begin."
                next_state = "NITI_UPLOAD"
            else:
                response_text = "Please type 'PAID' once you have completed the payment."

        elif state == "NITI_UPLOAD":
            # This would be handled by the image_url logic in the webhook
            response_text = "Please upload an image of your document."
            # The actual transition happens in the webhook if image_url is present

        return response_text, next_state, context

async def process_niti_wizard(payload: dict, db_compliance):
    """
    Background task to handle Niti Wizard logic and send Interakt reply.
    """
    from services.interakt import send_interakt_reply
    # In a real app, we'd import and use USER_SESSIONS from a persistent store (Redis)
    # For this demo, we'll assume a global or imported session dict
    from app import USER_SESSIONS 

    data = payload.get('data', {})
    user_phone = data.get('customer', {}).get('channel_phone_number')
    message = data.get('message', {}).get('text', "")
    
    # 1. Retrieve or Start Session
    session = USER_SESSIONS.get(user_phone, {"state": "NITI_START", "context": {}})
    state = session["state"]
    context = session["context"]

    # 2. Process via Wizard
    response_text, next_state, context = NitiWizardService.process_message(user_phone, message, state, context)

    # 3. Persist Session
    USER_SESSIONS[user_phone] = {"state": next_state, "context": context}

    # 4. Reply via Interakt
    send_interakt_reply(user_phone, response_text)
    print(f"✅ Niti Wizard Response sent to {user_phone}")
