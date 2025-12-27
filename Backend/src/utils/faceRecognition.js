import axios from 'axios';
import fs from 'fs';
import { ApiError } from './ApiError.js';

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || 'http://localhost:5000';
const FACE_SERVICE_TIMEOUT = parseInt(process.env.FACE_SERVICE_TIMEOUT) || 30000;
const FACE_SIMILARITY_THRESHOLD = parseFloat(process.env.FACE_SIMILARITY_THRESHOLD) || 0.6;
const FACE_SEARCH_TOP_N = parseInt(process.env.FACE_SEARCH_TOP_N) || 10;

/**
 * Call Python face recognition service
 * @param {string} endpoint - API endpoint path
 * @param {object} data - Request payload
 * @returns {Promise<object>} - Response data
 */
const callPythonService = async (endpoint, data) => {
    try {
        const response = await axios.post(
            `${FACE_SERVICE_URL}${endpoint}`,
            data,
            {
                timeout: FACE_SERVICE_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('Face recognition service is not running');
            throw new ApiError(503, 'Face recognition service unavailable');
        }
        
        if (error.response) {
            throw new ApiError(
                error.response.status,
                error.response.data?.error || 'Face recognition service error'
            );
        }
        
        throw new ApiError(500, `Face recognition error: ${error.message}`);
    }
};

/**
 * Extract face embedding from an image URL
 * @param {string} imageUrl - Cloudinary image URL
 * @returns {Promise<object>} - { success, embedding, error }
 */
const extractEmbedding = async (imageUrl) => {
    try {
        const result = await callPythonService('/api/face/extract-embedding', {
            imageUrl
        });
        
        return result;
    } catch (error) {
        console.error('Error extracting face embedding:', error.message);
        return {
            success: false,
            embedding: null,
            error: error.message
        };
    }
};

/**
 * Extract face embedding by sending a local file (base64) directly to Python
 * @param {string} filePath - Path to the uploaded temp file
 * @returns {Promise<object>} - { success, embedding, error }
 */
const extractEmbeddingFromFile = async (filePath) => {
    try {
        const fileBuffer = await fs.promises.readFile(filePath);
        const imageBase64 = fileBuffer.toString('base64');

        const result = await callPythonService('/api/face/extract-embedding', {
            imageBase64
        });

        return result;
    } catch (error) {
        console.error('Error extracting face embedding from file:', error.message);
        return {
            success: false,
            embedding: null,
            error: error.message
        };
    }
};

/**
 * Search for similar faces
 * @param {Array<number>} queryEmbedding - Query face embedding (128-D)
 * @param {Array<object>} allEmbeddings - Array of {userId, embedding}
 * @param {number} topN - Number of top matches to return
 * @returns {Promise<Array>} - Array of {userId, similarity}
 */
const searchSimilarFaces = async (queryEmbedding, allEmbeddings, topN = FACE_SEARCH_TOP_N,threshold=FACE_SIMILARITY_THRESHOLD) => {
    try {
        const result = await callPythonService('/api/face/search-similar', {
            queryEmbedding,
            allEmbeddings,
            topN,
            threshold
        });
        
        if (result.success) {
            return result.matches;
        }
        
        return [];
    } catch (error) {
        console.error('Error searching similar faces:', error.message);
        return [];
    }
};

/**
 * Save face embedding to user document
 * @param {object} user - User document (Alumni or Student)
 * @param {Array<number>} embedding - Face embedding (128-D)
 * @param {string} imageUrl - Cloudinary image URL
 */
const saveFaceEmbedding = async (user, embedding, imageUrl) => {
    try {
        user.faceEmbedding = {
            embedding,
            imageUrl,
            createdAt: new Date()
        };
        
        await user.save({ validateBeforeSave: false });
        
        console.log(`Face embedding saved for user: ${user._id}`);
        return true;
    } catch (error) {
        console.error('Error saving face embedding:', error.message);
        return false;
    }
};

/**
 * Extract and save face embedding for a user
 * Non-blocking - logs error but doesn't throw
 * @param {object} user - User document
 * @param {string} avatarUrl - Avatar image URL
 */
const extractAndSaveFaceEmbedding = async (user, avatarUrl) => {
    try {
        // Check if face service is available
        const healthCheck = await axios.get(`${FACE_SERVICE_URL}/health`, {
            timeout: 5000
        }).catch(() => null);
        
        if (!healthCheck) {
            console.warn('Face recognition service unavailable - skipping embedding extraction');
            return;
        }
        
        // Extract embedding
        const result = await extractEmbedding(avatarUrl);
        
        if (result.success && result.embedding) {
            await saveFaceEmbedding(user, result.embedding, avatarUrl);
            console.log(`Successfully extracted and saved face embedding for user ${user._id}`);
        } else {
            console.warn(`Could not extract face embedding: ${result.error}`);
        }
    } catch (error) {
        // Non-blocking - just log the error
        console.error('Face embedding extraction failed (non-critical):', error.message);
    }
};

/**
 * Delete face embedding from user
 * @param {object} user - User document
 */
const deleteFaceEmbedding = async (user) => {
    try {
        user.faceEmbedding = undefined;
        await user.save({ validateBeforeSave: false });
        return true;
    } catch (error) {
        console.error('Error deleting face embedding:', error.message);
        return false;
    }
};

/**
 * Check if face service is available
 * @returns {Promise<boolean>}
 */
const isFaceServiceAvailable = async () => {
    try {
        const response = await axios.get(`${FACE_SERVICE_URL}/health`, {
            timeout: 5000
        });
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

/**
 * Regenerate face embeddings for multiple users
 * @param {Array<object>} users - Array of user documents
 * @param {object} options - Options { forceRegenerate: boolean }
 * @returns {Promise<object>} - { total, processed, successful, failed, skipped, failures }
 */
const regenerateBulkEmbeddings = async (users, options = {}) => {
    const { forceRegenerate = false } = options;
    
    const results = {
        total: users.length,
        processed: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        failures: []
    };
    
    // Check if face service is available
    const isAvailable = await isFaceServiceAvailable();
    if (!isAvailable) {
        throw new Error('Face recognition service is not available');
    }
    
    // Process users sequentially (one at a time) to avoid ECONNRESET
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        
        try {
            // Skip if no avatar
            if (!user.avatar) {
                results.skipped++;
                results.processed++;
                continue;
            }
            
            // Skip if already has embedding and not forcing regeneration
            if (!forceRegenerate && user.faceEmbedding?.embedding?.length > 0) {
                results.skipped++;
                results.processed++;
                continue;
            }
            
            // Extract embedding
            const result = await extractEmbedding(user.avatar);
            
            if (result.success && result.embedding) {
                // Save embedding
                await saveFaceEmbedding(user, result.embedding, user.avatar);
                results.successful++;
                console.log(`✓ [${i+1}/${users.length}] Regenerated embedding for user: ${user._id}`);
            } else {
                results.failed++;
                results.failures.push({
                    userId: user._id.toString(),
                    email: user.email,
                    reason: result.error || 'No face detected'
                });
                console.warn(`✗ [${i+1}/${users.length}] Failed for user ${user._id}: ${result.error}`);
            }
            
            results.processed++;
        } catch (error) {
            results.failed++;
            results.failures.push({
                userId: user._id.toString(),
                email: user.email,
                reason: error.message
            });
            results.processed++;
            console.error(`✗ [${i+1}/${users.length}] Error processing user ${user._id}:`, error.message);
        }
        
        // Log progress every 10 users or at the end
        if ((i + 1) % 10 === 0 || (i + 1) === users.length) {
            console.log(`Progress: ${results.processed}/${results.total} - ✓ ${results.successful} successful, ✗ ${results.failed} failed, ⊘ ${results.skipped} skipped`);
        }
    }
    
    return results;
};

export {
    extractEmbedding,
    extractEmbeddingFromFile,
    searchSimilarFaces,
    saveFaceEmbedding,
    extractAndSaveFaceEmbedding,
    deleteFaceEmbedding,
    isFaceServiceAvailable,
    regenerateBulkEmbeddings,
    FACE_SIMILARITY_THRESHOLD,
    FACE_SEARCH_TOP_N
};
