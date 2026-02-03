<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1h6Cv7XIlQ9Ru4PgLJuQDZH2QXN7AFNTg

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and add your Gemini API key:
   ```
   cp .env.example .env
   ```
   Then edit `.env` and set your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
   Get your API key from: https://aistudio.google.com/app/apikey
   
3. Run the app:
   `npm run dev`
