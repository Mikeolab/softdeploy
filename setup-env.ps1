# Quick Environment Setup for Testing
# Run this before starting the server

# Set Supabase environment variables
$env:SUPABASE_URL="https://szzycvciwdxbmeyggdwh.supabase.co"
$env:SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6enljdmNpd3hkeGJtZXlnZ2R3aCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM2MjM4NDAwLCJleHAiOjIwNTE4MTQ0MDB9.example_key"
$env:PORT="5000"

# Set Gemini API Key (get from https://makersuite.google.com/app/apikey)
# Replace 'your_gemini_api_key_here' with your actual API key
$env:GEMINI_API_KEY="your_gemini_api_key_here"

Write-Host "Environment variables set. You can now run: npm start"
Write-Host "Note: Update GEMINI_API_KEY with your actual API key from https://makersuite.google.com/app/apikey"
