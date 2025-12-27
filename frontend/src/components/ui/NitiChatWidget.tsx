import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, ShieldCheck, FileSignature, MessageSquare, Globe, User, Building, CreditCard, Upload, FileText, Lock } from 'lucide-react';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    isAction?: boolean;
    options?: { label: string; value: string; action?: string }[];
}

type WizardState = 'LANGUAGE' | 'DPDP' | 'USER_TYPE' | 'FLOW_KYC' | 'FLOW_KYB' | 'PAYMENT' | 'UPLOAD' | 'COMPLETED' | 'CHAT';

export const NitiChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [wizardState, setWizardState] = useState<WizardState>('LANGUAGE');
    const [selectedLang, setSelectedLang] = useState('en-IN');
    const [userType, setUserType] = useState<'individual' | 'corporate' | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [displayedDPDP, setDisplayedDPDP] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const speak = (text: string, lang: string = selectedLang) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            startWizard();
        }
    }, [isOpen]);

    const addBotMessage = (text: string, options?: Message['options']) => {
        const id = Date.now();
        setMessages(prev => [...prev, { id, text, sender: 'bot', options }]);
        return id;
    };

    const startWizard = () => {
        setWizardState('LANGUAGE');
        addBotMessage("Namaste! Welcome to ComplianceDesk AI. Please select your preferred language to begin.", [
            { label: "English", value: "en-IN" },
            { label: "हिन्दी (Hindi)", value: "hi-IN" },
            { label: "मराठी (Marathi)", value: "mr-IN" },
            { label: "বাংলা (Bengali)", value: "bn-IN" },
            { label: "తెలుగు (Telugu)", value: "te-IN" },
            { label: "தமிழ் (Tamil)", value: "ta-IN" },
            { label: "ગુજરાતી (Gujarati)", value: "gu-IN" },
            { label: "اردو (Urdu)", value: "ur-IN" },
            { label: "ಕನ್ನಡ (Kannada)", value: "kn-IN" },
            { label: "ଓଡ଼ିଆ (Odia)", value: "or-IN" },
            { label: "മലയാളം (Malayalam)", value: "ml-IN" },
            { label: "ਪੰਜਾਬੀ (Punjabi)", value: "pa-IN" }
        ]);
    };

    const handleOptionClick = (label: string, value: string) => {
        setMessages(prev => [...prev, { id: Date.now(), text: label, sender: 'user' }]);

        if (wizardState === 'LANGUAGE') {
            setSelectedLang(value);
            setWizardState('DPDP');
            const dpdpText = {
                'en-IN': "**DPDP ACT 2023 CONSENT NOTICE**\nCompliance Desk AI (Data Fiduciary) requires your consent to process:\n1. **Name & ID Number**\n2. **Live Photo/Biometrics**\n**Purpose**: Identity Verification & Fraud Prevention.\n**Your Rights**: You can access, update, or withdraw consent at any time.\n**Grievance**: Contact our DPO at dpo@compliancedesk.ai or escalate to the Data Protection Board of India.\n**Agreement**: By clicking 'Agree', you provide free, specific, and informed consent.",
                'mr-IN': "**DPDP कायदा 2023 संमती सूचना**\nकम्प्लायन्स डेस्क एआय (डेटा फिडुशियरी) ला खालील गोष्टींवर प्रक्रिया करण्यासाठी तुमची संमती आवश्यक आहे:\n1. **नाव आणि आयडी क्रमांक**\n2. **थेट फोटो/बायोमेट्रिक्स**\n**उद्देश**: ओळख पडताळणी आणि फसवणूक प्रतिबंध.\n**तुमचे अधिकार**: तुम्ही कधीही संमती मिळवू शकता, अपडेट करू शकता किंवा मागे घेऊ शकता.\n**तक्रार**: dpo@compliancedesk.ai वर आमच्या डीपीओशी संपर्क साधा किंवा भारतीय डेटा संरक्षण मंडळाकडे तक्रार करा।\n**करार**: 'सहमत' वर क्लिक करून, तुम्ही मुक्त, विशिष्ट आणि माहितीपूर्ण संमती देता।",
                'hi-IN': "**DPDP अधिनियम 2023 सहमति सूचना**\nकम्प्लायंस डेस्क एआई (डेटा फिडुशियरी) को निम्नलिखित को संसाधित करने के लिए आपकी सहमति की आवश्यकता है:\n1. **नाम और आईडी संख्या**\n2. **लाइव फोटो/बायोमेट्रिक्स**\n**उद्देश्य**: पहचान सत्यापन और धोखाधड़ी निवारण।\n**आपके अधिकार**: आप किसी भी समय सहमति प्राप्त कर सकते हैं, अपडेट कर सकते हैं या वापस ले सकते हैं।\n**शिकायत**: dpo@compliancedesk.ai पर हमारे डीपीओ से संपर्क करें या भारतीय डेटा संरक्षण बोर्ड को सूचित करें।\n**अनुबंध**: 'सहमत' पर क्लिक करके, आप स्वतंत्र, विशिष्ट और सूचित सहमति प्रदान करते हैं।",
                'bn-IN': "**DPDP আইন 2023 সম্মতি বিজ্ঞপ্তি**\nCompliance Desk AI (ডেটা ফিডুসিয়ারি) আপনার নিম্নলিখিত তথ্য প্রক্রিয়াকরণের জন্য সম্মতি চাইছে:\n১. **নাম ও আইডি নম্বর**\n২. **লাইভ ফটো/বায়োমেট্রিক্স**\n**উদ্দেশ্য**: পরিচয় যাচাইকরণ এবং জালিয়াতি প্রতিরোধ।\n**আপনার অধিকার**: আপনি যেকোনো সময় সম্মতি প্রদান, আপডেট বা প্রত্যাহার করতে পারেন।\n**অভিযোগ**: আমাদের DPO এর সাথে dpo@compliancedesk.ai-এ যোগাযোগ করুন বা ভারতের ডেটা সুরক্ষা বোর্ডের কাছে অভিযোগ জানান।\n**চুক্তি**: 'সম্মত' ক্লিক করে, আপনি অবাধ, নির্দিষ্ট এবং অবহিত সম্মতি প্রদান করছেন।",
                'te-IN': "**DPDP చట్టం 2023 సమ్మతి నోటీసు**\nకంప్లైయెన్స్ డెస్క్ AI (డేటా ఫిడ్యూషియరీ) కింది వాటిని ప్రాసెస్ చేయడానికి మీ సమ్మతిని కోరుతోంది:\n1. **పేరు & ID సంఖ్య**\n2. **లైవ్ ఫోటో/బయోమెట్రిక్స్**\n**ఉద్దేశ్యం**: గుర్తింపు ధృవీకరణ & మోసాల నివారణ.\n**మీ హక్కులు**: మీరు ఎప్పుడైనా సమ్మతిని పొందవచ్చు, అప్‌డేట్ చేయవచ్చు లేదా ఉపసంహరించుకోవచ్చు.\n**ఫిర్యాదు**: మా DPOని dpo@compliancedesk.aiలో సంప్రదించండి లేదా భారత డేటా రక్షణ బోర్డుకు నివేదించండి.\n**అంగీకారం**: 'అంగీకరిస్తున్నాను' క్లిక్ చేయడం ద్వారా, మీరు స్వచ్ఛంద, నిర్దిష్ట మరియు సమాచారంతో కూడిన సమ్మతిని తెలియజేస్తున్నారు.",
                'ta-IN': "**DPDP சட்டம் 2023 ஒப்புதல் அறிவிப்பு**\nCompliance Desk AI (தரவு நம்பகத்தன்மை) பின்வருவனவற்றைச் செயலாக்க உங்கள் ஒப்புதலைக் கோருகிறது:\n1. **பெயர் மற்றும் அடையாள எண்**\n2. **நேரடி புகைப்படம்/உயிரியளவுகள்**\n**நோக்கம்**: அடையாளச் சரிபார்ப்பு மற்றும் மோசடி தடுப்பு.\n**உங்கள் உரிமைகள்**: நீங்கள் எந்த நேரத்திலும் ஒப்புதலை அணுகலாம், புதுப்பிக்கலாம் அல்லது திரும்பப் பெறலாம்.\n**குறைதீர்ப்பு**: dpo@compliancedesk.ai இல் எங்கள் DPO-வைத் தொடர்பு கொள்ளவும் அல்லது இந்திய தரவு பாதுகாப்பு வாரியத்திடம் புகார் அளிக்கவும்.\n**ஒப்பந்தம்**: 'ஏற்கிறேன்' என்பதைக் கிளிக் செய்வதன் மூலம், நீங்கள் சுதந்திரமாக, குறிப்பிட்ட மற்றும் தகவலறிந்த ஒப்புதலை வழங்குகிறீர்கள்.",
                'kn-IN': "**DPDP ಕಾಯಿದೆ 2023 ಸಮ್ಮತಿ ಸೂಚನೆ**\nಕಾಂಪ್ಲೈಯನ್ಸ್ ಡೆಸ್ಕ್ AI (ಡೇಟಾ ಫಿಡ್ಯೂಶಿಯರಿ) ಕೆಳಗಿನವುಗಳನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ನಿಮ್ಮ ಸಮ್ಮತಿಯನ್ನು ಬಯಸುತ್ತದೆ:\n1. **ಹೆಸರು ಮತ್ತು ID ಸಂಖ್ಯೆ**\n2. **ಲೈವ್ ಫೋಟೋ/ಬಯೋಮೆಟ್ರಿಕ್ಸ್**\n**ಉದ್ದೇಶ**: ಗುರುತಿನ ಪರಿಶೀಲನೆ ಮತ್ತು ವಂಚನೆ ತಡೆಗಟ್ಟುವಿಕೆ.\n**ನಿಮ್ಮ ಹಕ್ಕುಗಳು**: ನೀವು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಸಮ್ಮತಿಯನ್ನು ಪಡೆಯಬಹುದು, ನವೀಕರಿಸಬಹುದು ಅಥವಾ ಹಿಂಪಡೆಯಬಹುದು.\n**ದೂರು**: dpo@compliancedesk.ai ನಲ್ಲಿ ನಮ್ಮ DPO ಅನ್ನು ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ಭಾರತೀಯ ಡೇಟಾ ಸಂರಕ್ಷಣಾ ಮಂಡಳಿಗೆ ವರದಿ ಮಾಡಿ.\n**ಒಪ್ಪಂದ**: 'ಒಪ್ಪುತ್ತೇನೆ' ಕ್ಲಿಕ್ ಮಾಡುವ ಮೂಲಕ, ನೀವು ಸ್ವತಂತ್ರ, ನಿರ್ದಿಷ್ಟ ಮತ್ತು ತಿಳುವಳಿಕೆಯುಳ್ಳ ಸಮ್ಮತಿಯನ್ನು ನೀಡುತ್ತೀರಿ.",
                'gu-IN': "**DPDP એક્ટ 2023 સંમતિ સૂચના**\nકમ્પ્લાયન્સ ડેસ્ક AI (ડેટા ફિડ્યુશિયરી) ને નીચેના પર પ્રક્રિયા કરવા માટે તમારી સંમતિની જરૂર છે:\n1. **નામ અને આઈડી નંબર**\n2. **લાઇવ ફોટો/બાયોમેટ્રિક્સ**\n**હેતુ**: ઓળખ ચકાસણી અને છેતરપિંડી નિવારણ.\n**તમારા અધિકારો**: તમે કોઈપણ સમયે સંમતિ મેળવી શકો છો, અપડેટ કરી શકો છો કે પરત ખેંચી શકો છો.\n**ફરિયાદ**: dpo@compliancedesk.ai પર અમારા DPO નો સંપર્ક કરો અથવા ભારતીય ડેટા પ્રોટેક્શન બોર્ડને જાણ કરો.\n**કરાર**: 'સંમત' પર ક્લિક કરીને, તમે મુક્ત, વિશિષ્ટ અને જાણકાર સંમતિ આપો છો.",
                'ur-IN': "**ڈی پی ڈی پی ایکٹ 2023 رضامندی کا نوٹس**\nکمپلائنس ڈیسک AI (ڈیٹا فیڈوشری) کو درج ذیل پر کارروائی کرنے کے لیے آپ کی رضامندی درکار ہے:\n1. **نام اور آئی ڈی نمبر**\n2. **لائیو تصویر/بایومیٹرکس**\n**مقصد**: شناخت کی تصدیق اور دھوکہ دہی کی روک تھام۔\n**آپ کے حقوق**: آپ کسی بھی وقت رضامندی تک رسائی، اپ ڈیٹ یا واپس لے سکتے ہیں۔\n**شکایت**: dpo@compliancedesk.ai پر ہمارے ڈی پی او سے رابطہ کریں یا ڈیٹا پروٹیکشن بورڈ آف انڈیا کو مطلع کریں۔\n**معاہدہ**: 'اتفاق کرتا ہوں' پر کلک کر کے، آپ آزادانہ، مخصوص اور باخبر رضامندی فراہم کرتے ہیں۔",
                'or-IN': "**DPDP ଅଧିନିୟମ 2023 ସମ୍ମତି ବିଜ୍ଞପ୍ତି**\nCompliance Desk AI (ଡାଟା ଫିଡୁସିଆରୀ) ଆପଣଙ୍କର ନିମ୍ନଲିଖିତ ତଥ୍ୟ ପ୍ରକ୍ରିୟାକରଣ ପାଇଁ ସମ୍ମତି ଚାହୁଁଛି:\n୧. **ନାମ ଏବଂ ପରିଚୟ ପତ୍ର ସଂଖ୍ୟା**\n୨. **ଲାଇଭ୍ ଫଟୋ/ବାୟୋମେଟ୍ରିକ୍ସ**\n**ଉଦ୍ଦେଶ୍ୟ**: ପରିଚୟ ଯାଞ୍ચ ଏବଂ ଜାଲିଆତି ରୋକିବା |\n**ଆପଣଙ୍କ ଅଧିକାର**: ଆପଣ ଯେକୌଣସି ସମୟରେ ସମ୍ମତି ପ୍ରଦାନ, ଅପଡେଟ୍ କିମ୍ବା ପ୍ରତ୍ୟାହାର କରିପାରିବେ |\n**ଅଭିଯୋଗ**: ଆମ DPO ସହିତ dpo@compliancedesk.ai ରେ ଯୋଗାଯୋଗ କରନ୍ତୁ କିମ୍ବା ଭାରତୀୟ ଡାଟା ପ୍ରୋଟେକ୍ସନ୍ ବୋର୍ଡକୁ ଜଣାନ୍ତୁ |\n**ଚୁକ୍ତି**: 'ସମ୍ମତ' କ୍ଲିକ୍ କରି ଆପଣ ମୁକ୍ତ, ନିର୍ଦ୍ଦିଷ୍ଟ ଏବଂ ସୂଚନା ସମ୍ମତି ପ୍ରଦାନ କରୁଛନ୍ତି |",
                'ml-IN': "**DPDP ആക്ട് 2023 സമ്മത അറിയിപ്പ്**\nകംപ്ലയൻസ് ഡെസ്ക് AI (ഡാറ്റ ഫിഡ്യൂഷ്യറി) ഇനിപ്പറയുന്നവ പ്രോസസ്സ് ചെയ്യുന്നതിന് നിങ്ങളുടെ സമ്മതം ആവശ്യപ്പെടുന്നു:\n1. **പേരും ഐഡി നമ്പറും**\n2. **ലൈവ് ഫോട്ടോ/ബയോമെട്രിക്സ്**\n**ഉദ്ദേശ്യം**: തിരിച്ചറിയൽ പരിശോധനയും തട്ടിപ്പ് തടയലും.\n**നിങ്ങളുടെ അവകാശങ്ങൾ**: നിങ്ങൾക്ക് എപ്പോൾ വേണമെങ്കിലും സമ്മതം ആക്സസ് ചെയ്യാനോ പുതുക്കാനോ പിൻവലിക്കാനോ കഴിയും.\n**പരാതി**: dpo@compliancedesk.ai-ൽ ഞങ്ങളുടെ DPO-യെ ബന്ധപ്പെടുക അല്ലെങ്കിൽ ഡാറ്റ പ്രൊട്ടക്ഷൻ ബോർഡ് ഓഫ് ఇండియాയെ അറിയിക്കുക.\n**കരാർ**: 'അംഗീകരിക്കുന്നു' എന്നത് ക്ലിക്ക് ചെയ്യുന്നതിലൂടെ, നിങ്ങൾ സ്വതന്ത്രവും നിർദ്ദിഷ്ടവും അറിവുള്ളതുമായ സമ്മതം നൽകുന്നു.",
                'pa-IN': "**DPDP ਐਕਟ 2023 ਸਹਿਮਤੀ ਨੋਟਿਸ**\nਕੰਪਲਾਇੰਸ ਡੈਸਕ AI (ਡਾਟਾ ਫਿਡਿਊਸ਼ਰੀ) ਨੂੰ ਹੇਠ ਲਿਖਿਆਂ ਦੀ ਪ੍ਰਕਿਰਿਆ ਕਰਨ ਲਈ ਤੁਹਾਡੀ ਸਹਿਮਤੀ ਦੀ ਲੋੜ ਹੈ:\n1. **ਨਾਮ ਅਤੇ ਆਈਡੀ ਨੰਬਰ**\n2. **ਲਾਈਵ ਫੋਟੋ/ਬਾਇਓਮੈਟ੍ਰਿਕਸ**\n**ਉਦੇਸ਼**: ਪਛਾਣ ਦੀ ਪੁਸ਼ਟੀ ਅਤੇ ਧੋਖਾਧੜੀ ਦੀ ਰੋਕਥਾਮ।\n**ਤੁਹਾਡੇ ਅਧਿਕਾਰ**: ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਸਮੇਂ ਸਹਿਮਤੀ ਤੱਕ ਪਹੁੰਚ ਸਕਦੇ ਹੋ, ਅਪਡੇਟ ਕਰ ਸਕਦੇ ਹੋ ਜਾਂ ਵਾਪਸ ਲੈ ਸਕਦੇ ਹੋ।\n**ਸ਼ਿਕਾਇਤ**: dpo@compliancedesk.ai 'ਤੇ ਸਾਡੇ DPO ਨਾਲ ਸੰਪਰਕ ਕਰੋ ਜਾਂ ਭਾਰਤੀ ਡੇਟਾ ਪ੍ਰੋਟੈਕਸ਼ਨ ਬੋਰਡ ਨੂੰ ਸੂਚਿਤ ਕਰੋ।\n**ਸਮਝੌਤਾ**: 'ਸਹਿਮਤ' 'ਤੇ ਕਲਿੱਕ ਕਰਕੇ, ਤੁਸੀਂ ਸੁਤੰਤਰ, ਵਿਸ਼ੇਸ਼ ਅਤੇ ਸੂਚਿਤ ਸਹਿਮਤੀ ਪ੍ਰਦਾਨ ਕਰਦੇ ਹੋ।"
            }[value] || "Under the DPDP Act 2023...";

            setDisplayedDPDP(dpdpText);
            setTimeout(() => {
                addBotMessage(dpdpText, [
                    { label: "I Consent & Agree", value: "agree" },
                    { label: "Decline", value: "decline" }
                ]);
                speak(dpdpText, value);
            }, 600);
        } else if (wizardState === 'DPDP') {
            if (value === 'agree') {
                // Sign Consent in Backend
                fetch('http://localhost:8000/dpdp/sign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: "DEMO_USER_" + Date.now(),
                        signature: "digital_sign_placeholder",
                        form_text: displayedDPDP
                    })
                }).then(res => res.json()).then(data => {
                    console.log("Consent Hash Generated:", data.hash);
                    addBotMessage(`✅ Consent securely recorded in Compliance Vault (Hash: ${data.hash.substring(0, 8)})`);
                });

                setWizardState('USER_TYPE');
                setTimeout(() => {
                    addBotMessage("Great! Now, are you an Individual user or a Corporate user?", [
                        { label: "Individual", value: "individual" },
                        { label: "Corporate", value: "corporate" }
                    ]);
                }, 600);
            } else {
                addBotMessage("We cannot proceed without your consent according to the DPDP Act.");
            }
        } else if (wizardState === 'USER_TYPE') {
            if (value === 'individual') {
                setUserType('individual');
                setWizardState('FLOW_KYC');
                setTimeout(() => {
                    addBotMessage("As an Individual, you can choose from our bouquet of KYC & KYB verifications:", [
                        { label: "Individual KYC (Aadhaar/PAN)", value: "kyc" },
                        { label: "Freelancer/Small Biz KYB", value: "kyb" },
                        { label: "Voter ID Check", value: "voter" },
                        { label: "Passport Validation", value: "passport" }
                    ]);
                }, 600);
            } else {
                setUserType('corporate');
                setWizardState('UPLOAD');
                setTimeout(() => {
                    addBotMessage("As a Corporate user, your verifications are managed via your company's master contract.");
                    addBotMessage("Mandated Verification List:\n1. Identity (Aadhaar/PAN)\n2. Address Proof (Utility Bill)\n3. Criminal Records (Police Check)\n4. Employment & Education History");
                    const uploadPrompt = "Please upload your documents to begin the mandated verification process. Our system is ready.";
                    addBotMessage(uploadPrompt, [
                        { label: "Ready to Upload", value: "upload_done" }
                    ]);
                    speak(uploadPrompt);
                }, 600);
            }
        } else if (wizardState === 'FLOW_KYC') {
            setWizardState('PAYMENT');
            setTimeout(() => {
                addBotMessage(`You selected ${label}. Please proceed to payment to start your individual verification tunnel.`, [
                    { label: "Proceed to Payment", value: "pay" }
                ]);
            }, 600);
        } else if (wizardState === 'PAYMENT') {
            setWizardState('UPLOAD');
            setTimeout(() => {
                addBotMessage("Payment Successful! ✅");
                const uploadPrompt = "Please upload the required documents now. Our system is ready to receive your files securely.";
                addBotMessage(uploadPrompt, [
                    { label: "Simulate Upload", value: "upload_done" }
                ]);
                speak(uploadPrompt);
            }, 800);
        } else if (wizardState === 'UPLOAD') {
            setWizardState('COMPLETED');
            setTimeout(() => {
                if (userType === 'individual') {
                    addBotMessage("Documents received. Your AI-generated verification report will be ready in PDF format in a few moments. 📄");
                } else {
                    addBotMessage("KYB processing started. Please contact your Company Admin for the final report and onboarding status. 🏢");
                }

                addBotMessage("Security Highlight: Our project uses 'Fortress Network' security and zero-trust vault logic to ensure your PII never leaks. DPDP Act 2023 compliance is strictly enforced with audit logs.");
                addBotMessage("You can now ask me any other compliance or platform related questions.", [
                    { label: "Talk to Niti AI", value: "chat_mode" }
                ]);
            }, 800);
        } else if (value === 'chat_mode') {
            setWizardState('CHAT');
            addBotMessage("I am now in conversational mode. How can I assist you with your compliance journey today?");
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/niti/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMsg.text, user_id: 'guest_user' })
            });

            const data = await response.json();

            setTimeout(() => {
                const botMsg: Message = {
                    id: Date.now() + 1,
                    text: data.text,
                    sender: 'bot'
                };
                setMessages(prev => [...prev, botMsg]);
                setIsTyping(false);
            }, 800);

        } catch (error) {
            console.error("Chat Error", error);
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
                        style={{ maxHeight: '640px', height: '600px' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <ShieldCheck size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base">Niti Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        <p className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold">DPDP Compliant AI</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.sender === 'user'
                                            ? 'bg-emerald-600 text-white rounded-tr-none'
                                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                            }`}
                                    >
                                        {msg.text.split('\n').map((line, i) => (
                                            <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                                        ))}

                                        {msg.options && (
                                            <div className="mt-4 flex flex-col gap-2">
                                                {msg.options.map((opt, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleOptionClick(opt.label, opt.value)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-medium rounded-xl border border-slate-200 hover:border-emerald-200 transition-all text-left text-xs"
                                                    >
                                                        {opt.value.includes('en-IN') && <Globe size={14} />}
                                                        {opt.value === 'individual' && <User size={14} />}
                                                        {opt.value === 'corporate' && <Building size={14} />}
                                                        {opt.value === 'pay' && <CreditCard size={14} />}
                                                        {opt.value === 'upload_done' && <Upload size={14} />}
                                                        {opt.value === 'agree' && <FileSignature size={14} />}
                                                        {opt.value === 'chat_mode' && <MessageSquare size={14} />}
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-75" />
                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100 pb-6">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder={wizardState === 'CHAT' ? "Ask about compliance..." : "Please select an option above..."}
                                        disabled={wizardState !== 'CHAT'}
                                        className="w-full bg-slate-100 border border-slate-200 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition disabled:opacity-50"
                                    />
                                    <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputText.trim() || wizardState !== 'CHAT'}
                                    className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition transform active:scale-95 shadow-lg shadow-emerald-500/20"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-3 opacity-60">
                                <FileText size={10} className="text-slate-400" />
                                <p className="text-[9px] text-slate-500 font-medium tracking-wide uppercase">
                                    Secure Verification Tunnel • DPDP V1.0
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Launcher Button & Greeting Bubble */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                <AnimatePresence>
                    {!isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            className="bg-white border border-green-100 shadow-xl rounded-t-2xl rounded-bl-2xl p-4 mb-3 max-w-[200px]"
                        >
                            <p className="text-sm leading-snug">
                                <span className="text-green-600 font-bold block mb-1">Namaste! I am Niti.</span>
                                Need help with compliance?
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-green-100/50 transition-all relative group border-4 border-white overflow-hidden"
                >
                    <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-5 transition-opacity" />
                    {isOpen ? (
                        <X size={24} className="text-slate-400" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-50">
                            <ShieldCheck size={28} className="text-green-600" />
                        </div>
                    )}
                </motion.button>
            </div>
        </div>
    );
};
