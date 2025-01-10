# Photo Background Remover

## Features

- Upload an image
- Remove background
- Show preview of the image with a transparent background
- Download the image with a transparent background as a PNG file

## Tech Stack

- React
- Tailwind
- shadcn
- Vercel

## Deployment

This application is configured for deployment on Vercel. To deploy:

1. Fork or push this repository to GitHub
2. Create an account on [Vercel](https://vercel.com) if you haven't already
3. Create a new project on Vercel and import your GitHub repository
4. Configure the following settings:
   - Framework Preset: Other
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
5. Add any required environment variables
6. Click "Deploy"

The application will be automatically deployed and you'll receive a URL where it's accessible.

## Local Development

1. Clone the repository
2. Install backend dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
4. Start the development servers:
   - Backend: `python server.py`
   - Frontend: `cd frontend && npm run dev`
