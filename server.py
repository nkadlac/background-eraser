from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from rembg import remove
from PIL import Image
import io
import logging
import uvicorn
import os

app = FastAPI()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add CORS middleware with specific allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "https://bg-delete.vercel.app",  # Vercel production
        "http://bg-delete.vercel.app",  # Vercel production (http)
        "https://background-eraser-production.up.railway.app",  # Railway URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "healthy"}

@app.post("/remove-background")
async def remove_background(file: UploadFile = File(...)):
    try:
        logger.info(f"Processing file: {file.filename}")
        # Read the image
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))
        
        logger.info("Removing background...")
        # Remove the background
        output_image = remove(input_image)
        
        # Convert the image to bytes
        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        logger.info("Successfully processed image")
        return Response(content=img_byte_arr, media_type="image/png")
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True) 