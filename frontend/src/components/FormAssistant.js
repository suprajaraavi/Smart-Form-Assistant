import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import { Tooltip } from "react-tooltip";
import axios from "axios";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import "../i18n/i18n";

const FormAssistant = ({ backendUrl }) => {
  const { t, i18n } = useTranslation();

  // State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [formAnalysis, setFormAnalysis] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedField, setSelectedField] = useState(null);
  const [fieldExplanation, setFieldExplanation] = useState(null);
  const [autofillSuggestions, setAutofillSuggestions] = useState([]);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState("upload");

  const API = `${backendUrl}/api`;

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'kn', name: 'ಕನ್ನಡ' }
  ];

  useEffect(() => {
    const browserLang = navigator.language.substring(0, 2);
    const supportedLang = languages.find(lang => lang.code === browserLang);
    if (supportedLang) i18n.changeLanguage(browserLang);
  }, []);

  // File upload handling
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10485760,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);
        await processFile(file);
      }
    }
  });

  // Process file: upload to backend
  const processFile = async (file) => {
    setIsProcessing(true);
    setProcessingProgress(20);

    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const response = await axios.post(`${API}/upload-form`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProcessingProgress(70);

      // Get autofill suggestions
      const fieldNames = response.data.fields.map(f => f.name);
      const autofillResponse = await axios.post(`${API}/autofill-suggestions`, fieldNames);

      setAutofillSuggestions(autofillResponse.data);
      setFormAnalysis(response.data);
      setProcessingProgress(100);
      setActiveTab("form");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error processing file. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  // Field hover explanation
  const handleFieldHover = async (field) => {
    if (selectedField?.id === field.id) return;
    setSelectedField(field);

    try {
      const response = await axios.post(`${API}/explain-field`, {}, {
        params: {
          field_name: field.name,
          form_type: formAnalysis?.form_type || 'general',
          language: i18n.language === 'en' ? 'english' : i18n.language
        }
      });
      setFieldExplanation(response.data);
    } catch (error) {
      console.error("Error fetching field explanation:", error);
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const applyAutofill = (fieldName, value) => {
    handleInputChange(fieldName, value);
  };

  // Chat
  const sendChatMessage = async () => {
    if (!currentMessage.trim()) return;

    const messageToSend = currentMessage;
    setChatMessages(prev => [...prev, { type: 'user', message: messageToSend, timestamp: new Date() }]);
    setCurrentMessage("");

    try {
      const response = await axios.post(`${API}/chat`, {
        message: messageToSend,
        language: i18n.language === 'en' ? 'english' : i18n.language,
        form_context: formAnalysis?.form_type
      });

      setChatMessages(prev => [...prev, { type: 'bot', message: response.data.response, suggestions: response.data.suggestions, timestamp: new Date() }]);
    } catch (error) {
      console.error("Error sending chat message:", error);
    }
  };

  const changeLanguage = (langCode) => i18n.changeLanguage(langCode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            FormBuddy AI
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('upload_description')}
          </p>
          <div className="flex justify-center gap-2 mt-4">
            {languages.map(lang => (
              <Button key={lang.code} variant={i18n.language === lang.code ? "default" : "outline"} size="sm" onClick={() => changeLanguage(lang.code)} className="text-xs">
                {lang.name}
              </Button>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">📤 {t('upload_form')}</TabsTrigger>
            <TabsTrigger value="form" disabled={!formAnalysis}>📝 Fill Form</TabsTrigger>
            <TabsTrigger value="chat">💬 {t('ai_assistant')}</TabsTrigger>
            <TabsTrigger value="templates">📋 {t('templates')}</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Form</CardTitle>
                <CardDescription>
                  Upload PDF or image files. Our AI will analyze and help you fill the form.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isProcessing ? (
                  <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    <input {...getInputProps()} />
                    <div className="text-4xl mb-4">📁</div>
                    {isDragActive ? <p className="text-blue-600">Drop your form here...</p> :
                      <div>
                        <p className="text-gray-600 mb-2">Drag & drop your form here, or click to browse</p>
                        <p className="text-sm text-gray-400">Supports PDF, JPG, PNG (max 10MB)</p>
                      </div>
                    }
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium mb-2">Processing your form...</h3>
                    <Progress value={processingProgress} className="max-w-md mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{processingProgress}% complete</p>
                  </div>
                )}

                {uploadedFile && !isProcessing && (
                  <Alert className="mt-4">
                    <AlertDescription>✅ Successfully uploaded: {uploadedFile.name}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Form Tab */}
          <TabsContent value="form" className="space-y-6">
            {formAnalysis && (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Fields */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Form Fields</CardTitle>
                        <Badge variant="outline">{formAnalysis.form_type.replace('_', ' ').toUpperCase()}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formAnalysis.fields.map(field => (
                        <div key={field.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium cursor-help" onMouseEnter={() => handleFieldHover(field)}>
                              {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {autofillSuggestions.find(s => s.field_name === field.name) && (
                              <Button variant="ghost" size="sm" onClick={() => applyAutofill(field.name, autofillSuggestions.find(s => s.field_name === field.name).suggested_value)}>
                                ✨ Autofill
                              </Button>
                            )}
                          </div>
                          {field.type === 'textarea' ? (
                            <Textarea placeholder={`Enter ${field.label}`} value={formData[field.name] || ''} onChange={(e) => handleInputChange(field.name, e.target.value)} />
                          ) : (
                            <Input type={field.type} placeholder={`Enter ${field.label}`} value={formData[field.name] || ''} onChange={(e) => handleInputChange(field.name, e.target.value)} />
                          )}
                        </div>
                      ))}
                      <Button className="w-full mt-6">📤 Submit Form</Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Field Explanation */}
                <div>
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">💡 Field Help
                        {selectedField && <Badge variant="outline" className="text-xs">{selectedField.required ? "Required" : "Optional"}</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {fieldExplanation ? (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-blue-600 mb-2">{fieldExplanation.field_name.replace('_', ' ').toUpperCase()}</h4>
                          <p className="text-sm text-gray-700">{fieldExplanation.description}</p>
                          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <p className="text-xs font-medium text-green-800 mb-1">✅ Example:</p>
                            <p className="text-sm text-green-700 font-mono bg-white px-2 py-1 rounded border">{fieldExplanation.example}</p>
                          </div>
                          {fieldExplanation.tips && fieldExplanation.tips.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                              <p className="text-xs font-medium text-amber-800 mb-2">💡 Helpful Tips:</p>
                              <ul className="text-xs text-amber-700 space-y-1">{fieldExplanation.tips.map((tip,i)=><li key={i}>• {tip}</li>)}</ul>
                            </div>
                          )}
                          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={()=>setCurrentMessage(`Tell me more about ${fieldExplanation.field_name} field`)}>
                            🤖 Ask AI for more help
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Hover over a field to see help...</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>AI Form Assistant</CardTitle>
                <CardDescription>Ask me anything about filling forms or specific fields</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {chatMessages.map((msg,i)=>(
                    <div key={i} className={`flex ${msg.type==='user'?'justify-end':'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${msg.type==='user'?'bg-blue-500 text-white ml-4':'bg-white border border-gray-200 text-gray-800 mr-4 shadow-sm'}`}>
                        <p className="text-sm">{msg.message}</p>
                        {msg.suggestions && msg.suggestions.length>0 && <div className="mt-2 border-t border-gray-300">
                          {msg.suggestions.map((s,j)=><Button key={j} variant="ghost" size="sm" className="text-xs w-full" onClick={()=>setCurrentMessage(s)}>{s}</Button>)}
                        </div>}
                      </div>
                    </div>
                  ))}
                  {chatMessages.length===0 && <p className="text-gray-500 text-center mt-8">Ask me anything about forms!</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="Ask me anything..." value={currentMessage} onChange={e=>setCurrentMessage(e.target.value)} onKeyPress={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChatMessage();}}} />
                    <Button onClick={sendChatMessage} disabled={!currentMessage.trim()}>📤</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {['government','job_application','university','general'].map(type=>(
                <Card key={type} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader><CardTitle>{type.replace('_',' ').toUpperCase()}</CardTitle></CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">View Template</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Tooltip id="field-tooltip" />
      </div>
    </div>
  );
};

export default FormAssistant;
