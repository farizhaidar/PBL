# sentimen/sentimen_route.py

from fastapi import APIRouter
from pydantic import BaseModel
import joblib

# Load model
clf = joblib.load("random_forest_model.pkl")
tfidf = joblib.load("tfidf_vectorizer.pkl")
label_encoder = joblib.load("label_encoder.pkl")

# Setup router
router = APIRouter(prefix="/sentimen", tags=["Sentiment"])

# Input schema
class TextInput(BaseModel):
    text: str

# Endpoint
@router.post("/predict")
def predict_sentiment(data: TextInput):
    tfidf_input = tfidf.transform([data.text])
    prediction = clf.predict(tfidf_input)
    label = label_encoder.inverse_transform(prediction)[0]
    return {"text": data.text, "label": label}
