from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from face_service import FaceRecognitionService
from config import Config

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

# Initialize face recognition service
face_service = FaceRecognitionService()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Face Recognition Service',
        'version': '1.0.0'
    }), 200

@app.route('/api/face/extract-embedding', methods=['POST'])
def extract_embedding():
    """
    Extract face embedding from an image URL
    
    Request body:
    {
        "imageUrl": "https://cloudinary.com/..."
    }
    
    Response:
    {
        "success": true,
        "embedding": [128 floats],
        "faceDetected": true,
        "error": null
    }
    """
    try:
        # Support 3 input modes:
        # 1) multipart/form-data with file field 'image'
        # 2) JSON with 'imageBase64'
        # 3) JSON with 'imageUrl'

        # 1) multipart file
        if 'image' in request.files:
            image_file = request.files['image']
            bytes_data = image_file.read()
            result = face_service.extract_embedding_from_bytes(bytes_data)
        else:
            data = request.get_json(silent=True) or {}

            if 'imageBase64' in data:
                import base64
                try:
                    bytes_data = base64.b64decode(data['imageBase64'])
                except Exception as e:
                    return jsonify({
                        'success': False,
                        'error': f'invalid base64 image: {str(e)}'
                    }), 400
                result = face_service.extract_embedding_from_bytes(bytes_data)
            elif 'imageUrl' in data:
                image_url = data['imageUrl']
                result = face_service.extract_embedding(image_url)
            else:
                return jsonify({
                    'success': False,
                    'error': 'image (multipart), imageBase64, or imageUrl is required'
                }), 400

        if result['success']:
            return jsonify({
                'success': True,
                'embedding': result['embedding'],
                'faceDetected': True,
                'error': None
            }), 200
        else:
            return jsonify({
                'success': False,
                'embedding': None,
                'faceDetected': False,
                'error': result['error']
            }), 200  # return 200 with success:false to allow graceful fallback client-side

    except Exception as e:
        logger.error(f"Error in extract_embedding: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/face/search-similar', methods=['POST'])
def search_similar():
    """
    Find similar faces by comparing embeddings
    
    Request body:
    {
        "queryEmbedding": [128 floats],
        "allEmbeddings": [
            {"userId": "...", "embedding": [128 floats]},
            ...
        ],
        "topN": 10,
        "threshold": 0.55  # optional similarity threshold (0-1), defaults to 0.55
    }
    
    Response:
    {
        "success": true,
        "matches": [
            {"userId": "...", "similarity": 0.85},
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'queryEmbedding' not in data or 'allEmbeddings' not in data:
            return jsonify({
                'success': False,
                'error': 'queryEmbedding and allEmbeddings are required'
            }), 400
        
        query_embedding = data['queryEmbedding']
        all_embeddings = data['allEmbeddings']

        # Coerce types robustly (clients may send strings)
        raw_top_n = data.get('topN', None)
        raw_threshold = data.get('threshold', None)

        # Defaults
        default_top_n = 10
        default_threshold = app.config.get('SIMILARITY_THRESHOLD', 0.6)

        # Parse topN
        try:
            top_n = int(raw_top_n) if raw_top_n is not None else default_top_n
        except (ValueError, TypeError):
            top_n = default_top_n

        # Guardrails for topN
        if top_n <= 0:
            top_n = default_top_n
        if top_n > 1000:
            top_n = 1000

        # Parse threshold
        try:
            threshold = float(raw_threshold) if raw_threshold is not None else default_threshold
        except (ValueError, TypeError):
            threshold = default_threshold

        # Clamp threshold to [0,1]
        threshold = max(0.0, min(1.0, threshold))

        logger.info(f"/api/face/search-similar called with topN={top_n}, threshold={threshold}, embeddings={len(all_embeddings)}")
        
        # Validate query embedding
        if not isinstance(query_embedding, list) or len(query_embedding) != 128:
            return jsonify({
                'success': False,
                'error': 'queryEmbedding must be an array of 128 numbers'
            }), 400
        
        # Find similar faces
        matches = face_service.find_similar_faces(
            query_embedding,
            all_embeddings,
            top_n,
            threshold
        )
        
        return jsonify({
            'success': True,
            'matches': matches
        }), 200
        
    except Exception as e:
        logger.error(f"Error in search_similar: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )
