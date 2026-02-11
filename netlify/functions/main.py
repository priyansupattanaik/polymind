from mangum import Mangum
from app.main import app

# Entry point for Netlify Functions
handler = Mangum(app)