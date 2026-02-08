
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "PolyMind API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # API Keys
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY")

    def check_keys(self):
        if not self.OPENROUTER_API_KEY:
            print("WARNING: OPENROUTER_API_KEY not found. OpenRouter models will fail.")

settings = Settings()
settings.check_keys()
