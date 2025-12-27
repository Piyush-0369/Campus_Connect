import dlib
import numpy as np
import cv2
import requests
from io import BytesIO
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class FaceRecognitionService:
    """
    Face recognition service using dlib for face detection and embedding extraction
    """
    
    def __init__(self):
        """Initialize dlib models"""
        try:
            # Load face detector
            self.detector = dlib.get_frontal_face_detector()
            
            # Load shape predictor for face alignment
            self.predictor = dlib.shape_predictor(
                'models/shape_predictor_5_face_landmarks.dat'
            )
            
            # Load face recognition model
            self.face_rec_model = dlib.face_recognition_model_v1(
                'models/dlib_face_recognition_resnet_model_v1.dat'
            )
            
            logger.info("Face recognition models loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading face recognition models: {str(e)}")
            raise Exception(f"Failed to initialize face recognition service: {str(e)}")
    
    def download_image(self, image_url):
        """
        Download image from URL
        
        Args:
            image_url: URL of the image
            
        Returns:
            numpy array of the image or None if failed
        """
        try:
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            
            # Convert to PIL Image
            img = Image.open(BytesIO(response.content))
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Convert to numpy array
            img_array = np.array(img)
            
            # Convert RGB to BGR for OpenCV/dlib
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            
            return img_array
            
        except Exception as e:
            logger.error(f"Error downloading image: {str(e)}")
            return None
    
    def detect_face(self, image):
        """
        Detect faces in an image
        
        Args:
            image: numpy array of the image
            
        Returns:
            dict with face detection results
        """
        try:
            # Convert to grayscale for detection
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.detector(gray, 1)
            
            if len(faces) == 0:
                return {
                    'success': False,
                    'error': 'No face detected in the image',
                    'faceCount': 0
                }
            
            if len(faces) > 1:
                return {
                    'success': False,
                    'error': 'Multiple faces detected. Please upload an image with a single face',
                    'faceCount': len(faces)
                }
            
            return {
                'success': True,
                'face': faces[0],
                'faceCount': 1
            }
            
        except Exception as e:
            logger.error(f"Error detecting face: {str(e)}")
            return {
                'success': False,
                'error': f'Face detection failed: {str(e)}'
            }
    
    def _extract_embedding_from_image(self, image):
        """Core extraction pipeline given a decoded image (numpy array)."""
        try:
            # Resize image if too large (for performance)
            max_dimension = 1024
            height, width = image.shape[:2]
            if max(height, width) > max_dimension:
                scale = max_dimension / max(height, width)
                new_width = int(width * scale)
                new_height = int(height * scale)
                image = cv2.resize(image, (new_width, new_height))

            # Detect face
            face_result = self.detect_face(image)
            if not face_result['success']:
                return face_result

            face_rect = face_result['face']

            # Get face landmarks for alignment
            shape = self.predictor(image, face_rect)

            # Extract 128-dimensional face embedding
            face_descriptor = self.face_rec_model.compute_face_descriptor(image, shape)

            # Convert to list for JSON serialization
            embedding = [float(x) for x in face_descriptor]

            logger.info(f"Successfully extracted face embedding (dim: {len(embedding)})")

            return {
                'success': True,
                'embedding': embedding,
                'error': None
            }
        except Exception as e:
            logger.error(f"Error extracting embedding: {str(e)}")
            return {
                'success': False,
                'error': f'Embedding extraction failed: {str(e)}'
            }

    def extract_embedding(self, image_url):
        """
        Extract 128-dimensional face embedding from image URL

        Args:
            image_url: URL of the image

        Returns:
            dict with embedding extraction results
        """
        try:
            # Download image
            image = self.download_image(image_url)
            if image is None:
                return {
                    'success': False,
                    'error': 'Failed to download image from URL'
                }

            return self._extract_embedding_from_image(image)

        except Exception as e:
            logger.error(f"Error extracting embedding: {str(e)}")
            return {
                'success': False,
                'error': f'Embedding extraction failed: {str(e)}'
            }

    def extract_embedding_from_bytes(self, bytes_data):
        """Extract embedding from raw image bytes."""
        try:
            # Load image from bytes via PIL, convert to RGB then numpy BGR
            img = Image.open(BytesIO(bytes_data))
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img_array = np.array(img)
            image = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

            return self._extract_embedding_from_image(image)
        except Exception as e:
            logger.error(f"Error decoding image bytes: {str(e)}")
            return {
                'success': False,
                'error': f'Invalid image data: {str(e)}'
            }
    
    def compute_similarity(self, embedding1, embedding2):
        """
        Compute similarity between two face embeddings using Euclidean distance.
        
        This is the standard method for dlib face recognition:
        - Euclidean distance < 0.6 = same person (highly similar)
        - Euclidean distance > 0.6 = different person (dissimilar)
        
        We convert distance to similarity score (0 to 1) for easier interpretation.
        
        Args:
            embedding1: First 128-D embedding
            embedding2: Second 128-D embedding
            
        Returns:
            Similarity score (0 to 1, higher is more similar)
        """
        try:
            # Convert to numpy arrays
            emb1 = np.array(embedding1)
            emb2 = np.array(embedding2)
            
            # Compute Euclidean distance (standard for dlib)
            distance = np.linalg.norm(emb1 - emb2)
            
            # Convert distance to similarity score using exponential decay
            # distance 0.0 -> similarity 1.0 (identical)
            # distance 0.6 -> similarity 0.55 (threshold, same person)
            # distance 1.0 -> similarity 0.37 (different person)
            # distance 2.0 -> similarity 0.14 (very different)
            similarity = np.exp(-distance)
            
            return float(similarity)
            
        except Exception as e:
            logger.error(f"Error computing similarity: {str(e)}")
            return 0.0
    
    def find_similar_faces(self, query_embedding, all_embeddings, top_n=10, threshold=0.55):
        """
        Find the most similar faces from a collection
        
        Args:
            query_embedding: Query face embedding (128-D)
            all_embeddings: List of dicts with 'userId' and 'embedding'
            top_n: Number of top matches to return
            threshold: Minimum similarity threshold
            
        Returns:
            List of matches sorted by similarity (highest first)
        """
        try:
            matches = []
            
            for item in all_embeddings:
                user_id = item.get('userId')
                embedding = item.get('embedding')
                
                if not user_id or not embedding:
                    continue
                
                # Skip if embedding is invalid
                if len(embedding) != 128:
                    logger.warning(f"Invalid embedding length for user {user_id}: {len(embedding)}")
                    continue
                
                # Compute similarity
                similarity = self.compute_similarity(query_embedding, embedding)
                
                # Only include if above threshold
                if similarity >= threshold:
                    matches.append({
                        'userId': user_id,
                        'similarity': similarity
                    })
            
            # Sort by similarity (descending)
            matches.sort(key=lambda x: x['similarity'], reverse=True)
            
            # Return top N matches
            return matches[:top_n]
            
        except Exception as e:
            logger.error(f"Error finding similar faces: {str(e)}")
            return []
