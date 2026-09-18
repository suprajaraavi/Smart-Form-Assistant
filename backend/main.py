# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime, timezone

# ------------------- FastAPI app -------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- Pydantic Models -------------------
class FormField(BaseModel):
    id: str = str(uuid.uuid4())
    name: str
    type: str
    label: str
    required: bool = False
    x: float = 0
    y: float = 0
    width: float = 100
    height: float = 30

class FormAnalysis(BaseModel):
    filename: str
    form_type: str
    fields: List[FormField]
    created_at: datetime = datetime.now(timezone.utc)

class FieldExplanation(BaseModel):
    field_name: str
    description: str
    example: str
    language: str
    tips: Optional[List[str]] = []

class ChatMessage(BaseModel):
    message: str
    language: str = "english"
    form_context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = []

class AutofillSuggestion(BaseModel):
    field_name: str
    suggested_value: str
    confidence: float

# ------------------- Endpoints -------------------
@app.post("/api/upload-form", response_model=FormAnalysis)
async def upload_form(file: UploadFile = File(...)):
    # Mock fields
    fields = [
        FormField(name="full_name", type="text", label="Full Name", required=True),
        FormField(name="email", type="email", label="Email", required=True),
    ]
    return FormAnalysis(filename=file.filename, form_type="general", fields=fields)

@app.post("/api/explain-field", response_model=FieldExplanation)
async def explain_field(field_name: str):
    return FieldExplanation(
        field_name=field_name,
        description="Enter your full name",
        example="John Doe",
        language="english",
        tips=["Use legal name", "Capitalize first letters"]
    )

@app.post("/api/autofill-suggestions", response_model=List[AutofillSuggestion])
async def autofill_suggestions(form_fields: List[str]):
    suggestions = [AutofillSuggestion(field_name=f, suggested_value="Sample Value", confidence=0.9) for f in form_fields]
    return suggestions

@app.post("/api/chat", response_model=ChatResponse)
async def chat(payload: ChatMessage):
    return ChatResponse(
        response=f"Echo: {payload.message}",
        suggestions=["Try filling full_name", "Check email format"]
    )

