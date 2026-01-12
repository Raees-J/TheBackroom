/**
 * Local Whisper Transcription Service
 * Uses Transformers.js with Whisper-Base (FREE: Runs on CPU)
 */

const { pipeline } = require('@xenova/transformers');
const config = require('../config');
const logger = require('../utils/logger');

// Transcription pipeline (lazy loaded)
let transcriber = null;
let isLoading = false;
let loadPromise = null;

/**
 * Initialize the Whisper transcription pipeline
 * @returns {Promise<object>} - The transcription pipeline
 */
async function getTranscriber() {
  if (transcriber) {
    return transcriber;
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  logger.info('Loading Whisper model (first time may take a minute)...', {
    model: config.whisper.model,
  });

  loadPromise = pipeline('automatic-speech-recognition', config.whisper.model, {
    quantized: true, // Use quantized model for faster inference
  });

  try {
    transcriber = await loadPromise;
    logger.info('Whisper model loaded successfully');
    return transcriber;
  } catch (error) {
    logger.error('Failed to load Whisper model', { error: error.message });
    isLoading = false;
    loadPromise = null;
    throw error;
  }
}

/**
 * Transcribe audio to text
 * @param {Buffer|ArrayBuffer} audioData - Audio data
 * @param {string} contentType - MIME type of the audio
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeAudio(audioData, contentType) {
  try {
    const pipe = await getTranscriber();

    logger.debug('Starting transcription', {
      contentType,
      dataSize: audioData.byteLength || audioData.length,
    });

    // Convert Buffer to Float32Array for Transformers.js
    const audioArray = await convertAudioToFloat32(audioData, contentType);

    // Run transcription
    const result = await pipe(audioArray, {
      chunk_length_s: 30,
      stride_length_s: 5,
      language: 'english',
      task: 'transcribe',
    });

    const transcription = result.text.trim();

    logger.info('Audio transcribed successfully', {
      textLength: transcription.length,
      text: transcription.substring(0, 100),
    });

    return transcription;
  } catch (error) {
    logger.error('Failed to transcribe audio', { error: error.message });
    throw error;
  }
}

/**
 * Convert audio buffer to Float32Array for Whisper
 * @param {Buffer} audioData - Raw audio data
 * @param {string} contentType - MIME type
 * @returns {Promise<Float32Array>} - Audio samples
 */
async function convertAudioToFloat32(audioData, contentType) {
  // For OGG/Opus (WhatsApp voice notes), we need to decode
  // Transformers.js can handle raw audio URLs or base64
  
  // Convert to base64 data URL for Transformers.js
  const buffer = Buffer.isBuffer(audioData) ? audioData : Buffer.from(audioData);
  const base64 = buffer.toString('base64');
  
  // Determine MIME type
  let mimeType = contentType || 'audio/ogg';
  if (mimeType.includes('opus')) {
    mimeType = 'audio/ogg';
  }
  
  const dataUrl = `data:${mimeType};base64,${base64}`;
  
  return dataUrl;
}

/**
 * Check if transcription service is ready
 * @returns {Promise<boolean>}
 */
async function isReady() {
  try {
    await getTranscriber();
    return true;
  } catch {
    return false;
  }
}

/**
 * Preload the model (call on server startup for faster first request)
 */
async function preloadModel() {
  try {
    logger.info('Preloading Whisper model...');
    await getTranscriber();
    logger.info('Whisper model preloaded and ready');
  } catch (error) {
    logger.warn('Failed to preload Whisper model', { error: error.message });
  }
}

module.exports = {
  transcribeAudio,
  isReady,
  preloadModel,
};
