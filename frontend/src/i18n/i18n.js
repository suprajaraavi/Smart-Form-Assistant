import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      "upload_description": "Your intelligent assistant for filling forms easily, accurately, and securely",
      "upload_form": "Upload Form",
      "ai_assistant": "AI Assistant",
      "templates": "Templates",
      "upload_title": "Upload Your Form",
      "upload_description": "Upload PDF or image files to get started. Our AI will analyze and help you fill the form.",
      "drag_drop": "Drag & drop your form here, or click to browse",
      "file_support": "Supports PDF, JPG, PNG (max 10MB)",
      "processing": "Processing your form...",
      "form_fields": "Form Fields",
      "field_help": "Field Help",
      "ai_assistant": "AI Form Assistant",
      "ask_anything": "Ask me anything about filling forms or get help with specific fields",
      "templates": "Form Templates",
      "government": "Government",
      "job_application": "Job Application", 
      "university": "University",
      "general": "General",
      "submit_form": "Submit Form",
      "autofill": "Autofill",
      "chat_placeholder": "Ask me anything about forms...",
      "hover_help": "Hover over any form field to get helpful explanations and examples."
    }
  },
  hi: {
    translation: {
      "upload_description": "आपका बुद्धिमान सहायक फॉर्म आसानी से, सटीक रूप से और सुरक्षित रूप से भरने के लिए",
      "upload_form": "फॉर्म अपलोड करें",
      "ai_assistant": "AI सहायक",
      "templates": "टेम्प्लेट",
      "upload_title": "अपना फॉर्म अपलोड करें",
      "upload_description": "शुरू करने के लिए PDF या इमेज फ़ाइलें अपलोड करें। हमारी AI आपके फॉर्म का विश्लेषण करेगी और भरने में मदद करेगी।",
      "drag_drop": "अपना फॉर्म यहाँ खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें",
      "file_support": "PDF, JPG, PNG समर्थित (अधिकतम 10MB)",
      "processing": "आपके फॉर्म को प्रोसेस कर रहे हैं...",
      "form_fields": "फॉर्म फ़ील्ड",
      "field_help": "फ़ील्ड सहायता",
      "ai_assistant": "AI फॉर्म सहायक",
      "ask_anything": "फॉर्म भरने के बारे में कुछ भी पूछें या विशिष्ट फ़ील्ड के लिए सहायता प्राप्त करें",
      "templates": "फॉर्म टेम्प्लेट",
      "government": "सरकारी",
      "job_application": "नौकरी का आवेदन",
      "university": "विश्वविद्यालय", 
      "general": "सामान्य",
      "submit_form": "फॉर्म जमा करें",
      "autofill": "ऑटोफिल",
      "chat_placeholder": "फॉर्म के बारे में कुछ भी पूछें...",
      "hover_help": "सहायक व्याख्या और उदाहरण पाने के लिए किसी भी फॉर्म फ़ील्ड पर होवर करें।"
    }
  },
  ta: {
    translation: {
      "upload_form": "உங்கள் படிவத்தை பதிவேற்றவும்",
      "upload_description": "தொடங்க PDF அல்லது பட கோப்புகளைப் பதிவேற்றவும். எங்கள் AI உங்கள் படிவத்தை பகுப்பாய்வு செய்து நிரப்ப உதவும்.",
      "drag_drop": "உங்கள் படிவத்தை இங்கே இழுத்து விடவும், அல்லது உலாவ கிளிக் செய்யவும்",
      "file_support": "PDF, JPG, PNG ஆதரிக்கப்படுகின்றன (அதிகபட்சம் 10MB)",
      "processing": "உங்கள் படிவத்தை செயல்படுத்துகிறோம்...",
      "form_fields": "படிவ புலங்கள்",
      "field_help": "புல உதவி",
      "ai_assistant": "AI படிவ உதவியாளர்",
      "ask_anything": "படிவங்களை நிரப்புவது பற்றி எதையும் கேளுங்கள் அல்லது குறிப்பிட்ட புலங்களுக்கு உதவி பெறுங்கள்",
      "templates": "படிவ வார்ப்புருக்கள்",
      "government": "அரசு",
      "job_application": "வேலை விண்ணப்பம்",
      "university": "பல்கலைக்கழகம்",
      "general": "பொது",
      "submit_form": "படிவத்தை சமர்பிக்கவும்",
      "autofill": "தானியங்கி நிரப்பல்",
      "chat_placeholder": "படிவங்களைப் பற்றி எதையும் கேளுங்கள்...",
      "hover_help": "உதவிகரமான விளக்கங்களையும் எடுத்துக்காட்டுகளையும் பெற எந்த படிவ புலத்திலும் ஹோவர் செய்யவும்।"
    }
  },
  kn: {
    translation: {
      "upload_form": "ನಿಮ್ಮ ಫಾರ್ಮ್ ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
      "upload_description": "ಪ್ರಾರಂಭಿಸಲು PDF ಅಥವಾ ಚಿತ್ರ ಫೈಲ್‌ಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ನಮ್ಮ AI ನಿಮ್ಮ ಫಾರ್ಮ್ ಅನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ತುಂಬಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
      "drag_drop": "ನಿಮ್ಮ ಫಾರ್ಮ್ ಅನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ ಮತ್ತು ಬಿಡಿ, ಅಥವಾ ಬ್ರೌಸ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
      "file_support": "PDF, JPG, PNG ಬೆಂಬಲಿತ (ಗರಿಷ್ಠ 10MB)",
      "processing": "ನಿಮ್ಮ ಫಾರ್ಮ್ ಅನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...",
      "form_fields": "ಫಾರ್ಮ್ ಕ್ಷೇತ್ರಗಳು",
      "field_help": "ಕ್ಷೇತ್ರ ಸಹಾಯ",
      "ai_assistant": "AI ಫಾರ್ಮ್ ಸಹಾಯಕ",
      "ask_anything": "ಫಾರ್ಮ್‌ಗಳನ್ನು ತುಂಬುವ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ ಅಥವಾ ನಿರ್ದಿಷ್ಟ ಕ್ಷೇತ್ರಗಳಿಗಾಗಿ ಸಹಾಯ ಪಡೆಯಿರಿ",
      "templates": "ಫಾರ್ಮ್ ಟೆಂಪ್ಲೇಟ್‌ಗಳು",
      "government": "ಸರ್ಕಾರಿ",
      "job_application": "ಉದ್ಯೋಗ ಅರ್ಜಿ",
      "university": "ವಿಶ್ವವಿದ್ಯಾಲಯ",
      "general": "ಸಾಮಾನ್ಯ",
      "submit_form": "ಫಾರ್ಮ್ ಸಲ್ಲಿಸಿ",
      "autofill": "ಸ್ವಯಂ ತುಂಬಿಸಿ",
      "chat_placeholder": "ಫಾರ್ಮ್‌ಗಳ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ...",
      "hover_help": "ಸಹಾಯಕ ವಿವರಣೆಗಳು ಮತ್ತು ಉದಾಹರಣೆಗಳನ್ನು ಪಡೆಯಲು ಯಾವುದೇ ಫಾರ್ಮ್ ಕ್ಷೇತ್ರದ ಮೇಲೆ ಹೋವರ್ ಮಾಡಿ."
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    }
  });

export default i18n;