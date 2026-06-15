from cryptography.fernet import Fernet
from app.core.config import settings
import base64


def _get_fernet() -> Fernet:
    key = settings.ENCRYPTION_KEY
    # Ensure proper base64 padding
    padded = key + "=" * (4 - len(key) % 4) if len(key) % 4 else key
    return Fernet(padded.encode() if isinstance(padded, str) else padded)


def encrypt_password(plain_password: str) -> str:
    f = _get_fernet()
    return f.encrypt(plain_password.encode()).decode()


def decrypt_password(encrypted_password: str) -> str:
    f = _get_fernet()
    return f.decrypt(encrypted_password.encode()).decode()
