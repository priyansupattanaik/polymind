
import os
from dotenv import load_dotenv
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
# We are in netlify/functions/app/core/config.py, so root is 4 levels up?
# actually relative to where we run it.
# Let's simple use absolute path logic relative to this file.
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# Locate the .env file in the project root
# current file is in netlify/functions/app/core/config.py
# .env is in project root (5 levels up from this file)
env_path = Path(__file__).resolve().parent.parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "PolyMind API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # API Keys
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY")

    def check_keys(self):
        missing = []
        if not self.GROQ_API_KEY:
            missing.append("GROQ_API_KEY")
        if not self.NVIDIA_API_KEY:
            missing.append("NVIDIA_API_KEY")
        if not self.OPENROUTER_API_KEY:
            missing.append("OPENROUTER_API_KEY")
        if missing:
            print(f"WARNING: Missing API keys: {', '.join(missing)}. Associated models will fail.")

settings = Settings()
settings.check_keys()
