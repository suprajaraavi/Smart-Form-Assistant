from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from contextlib import asynccontextmanager

# --------------------- Load environment variables ---------------------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# --------------------- MongoDB connection ---------------------
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise ValueError("MONGO_URL not set in .env file")

client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_db')]

# --------------------- Lifespan context ---------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("🚀 App starting...")
    yield
    # Shutdown logic
    client.close()
    print("🛑 MongoDB client closed.")

# --------------------- Initialize FastAPI app ---------------------
app = FastAPI(lifespan=lifespan)

# --------------------- CORS ---------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://formbuddy.preview.emergentagent.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------- Router ---------------------
api_router = APIRouter(prefix="/api")

# --------------------- Pydantic Models ---------------------
class FormField(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str
    label: str
    required: bool = False
    x: float
    y: float
    width: float
    height: float

class FormAnalysis(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    form_type: str
    language: str = "english"
    fields: List[FormField]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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

# --------------------- Helper Functions ---------------------
async def analyze_form_image(file: UploadFile) -> FormAnalysis:
    mock_fields = [
        FormField(name="full_name", type="text", label="Full Name", required=True, x=100, y=50, width=200, height=30),
        FormField(name="email", type="email", label="Email Address", required=True, x=100, y=100, width=200, height=30),
        FormField(name="phone", type="phone", label="Phone Number", required=False, x=100, y=150, width=200, height=30),
        FormField(name="date_of_birth", type="date", label="Date of Birth", required=True, x=100, y=200, width=200, height=30),
    ]
    return FormAnalysis(filename=file.filename or "unknown", form_type="general", fields=mock_fields)

# --------------------- API Endpoints ---------------------
@api_router.post("/upload-form", response_model=FormAnalysis)
async def upload_form(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    form_analysis = await analyze_form_image(file)
    form_dict = form_analysis.dict()
    form_dict['created_at'] = form_analysis.created_at.isoformat()
    await db.form_analyses.insert_one(form_dict)
    return form_analysis

@api_router.post("/explain-field", response_model=FieldExplanation)
async def explain_field(field_name: str, form_type: str = "general", language: str = "english"):
    field_data = {
        "full_name": {"description": "Enter your complete legal name", "example": "John Michael Smith", "tips": ["Use your legal name", "Include middle name", "Capitalize first letters"]},
        "email": {"description": "Enter a valid email address", "example": "john.smith@example.com", "tips": ["Use professional email", "Check spelling", "Avoid spaces"]},
        "phone": {"description": "Enter your contact phone number", "example": "+1-555-123-4567", "tips": ["Include country code", "Use active number"]},
        "date_of_birth": {"description": "Enter your date of birth", "example": "15/08/1990", "tips": ["Match ID documents", "Use correct format"]},
    }
    info = field_data.get(field_name, {"description": f"Enter your {field_name}", "example": f"Your {field_name}", "tips": ["Provide accurate info"]})
    return FieldExplanation(field_name=field_name, description=info["description"], example=info["example"], language=language, tips=info["tips"])

@api_router.post("/autofill-suggestions", response_model=List[AutofillSuggestion])
async def get_autofill_suggestions(form_fields: List[str], user_id: Optional[str] = None):
    mock_user_data = {"full_name": "John Doe", "email": "john.doe@example.com", "phone": "+1-555-0123", "date_of_birth": "15/08/1990", "address": "123 Main Street, City, State, ZIP"}
    suggestions = [AutofillSuggestion(field_name=f, suggested_value=mock_user_data[f], confidence=0.9) for f in form_fields if f in mock_user_data]
    return suggestions

@api_router.get("/form-templates")
async def get_form_templates(form_type: str = "general"):
    templates = {
        "government": {"description": "Government forms", "common_fields": ["full_name","father_name","date_of_birth","address","aadhaar_number","pan_number"], "tips": ["Keep your documents ready"]},
        "job_application": {"description": "Job applications", "common_fields": ["full_name","email","phone","resume","cover_letter","experience","education"], "tips": ["Use professional email", "Highlight experience"]},
        "university": {"description": "University applications", "common_fields": ["student_name","email","phone","academic_records","personal_statement"], "tips": ["Submit all required documents"]},
        "general": {"description": "General forms", "common_fields": ["name","email","phone","message"], "tips": ["Fill all required fields"]},
    }
    return templates.get(form_type, templates["general"])

# --------------------- Include router ---------------------
app.include_router(api_router)

# --------------------- WebSocket ---------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message received: {data}")
    except WebSocketDisconnect:
        print("WebSocket disconnected")

# --------------------- Logging ---------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
