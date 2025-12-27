import os

class Config:
    """Configuration for Face Recognition Service"""
    
    # Server configuration
    HOST = os.environ.get('FACE_SERVICE_HOST', '0.0.0.0')
    PORT = int(os.environ.get('FACE_SERVICE_PORT', 5000))
    DEBUG = os.environ.get('FACE_SERVICE_DEBUG', 'False').lower() == 'true'
    
    # Face recognition parameters
    SIMILARITY_THRESHOLD = float(os.environ.get('FACE_SIMILARITY_THRESHOLD', 0.6))
    MAX_IMAGE_SIZE = int(os.environ.get('MAX_IMAGE_SIZE', 1024))  # pixels
    
    # Request timeout
    IMAGE_DOWNLOAD_TIMEOUT = int(os.environ.get('IMAGE_DOWNLOAD_TIMEOUT', 10))  # seconds
