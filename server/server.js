const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { YoutubeTranscript } = require('youtube-transcript');

dotenv.config();

const app = express();
const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(cors());

const rateLimit = 60; // 60 requests per minute
let requestCount = 0;
let requestQueue = [];
let retryQueue = [];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleRequestQueue() {
  while (requestQueue.length > 0) {
    if (requestCount < rateLimit) {
      const { resolve, reject, chunk } = requestQueue.shift();
      try {
        const summary = await summarizeChunk(chunk);
        resolve(summary);
      } catch (error) {
        if (error.message.includes('429')) {
          console.warn('Rate limit exceeded. Adding to retry queue.');
          retryQueue.push({ resolve, reject, chunk });
        } else {
          reject(error);
        }
      }
      requestCount++;
    } else {
      await delay(60000); // Wait for 1 minute
      requestCount = 0;
    }
  }
}

async function handleRetryQueue() {
  while (retryQueue.length > 0) {
    const { resolve, reject, chunk } = retryQueue.shift();
    try {
      const summary = await summarizeChunk(chunk);
      resolve(summary);
    } catch (error) {
      console.warn('Retrying failed. Adding back to retry queue.');
      retryQueue.push({ resolve, reject, chunk });
      await delay(500); // Wait for 500ms before retrying
    }
  }
}

function splitText(text, chunkSize = 5000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
    console.log('Chunk:', chunks[chunks.length - 1]);
  }
  console.log('Total chunks:', chunks.length);
  return chunks;
}

function summarizeChunk(chunk) {
  return new Promise(async (resolve, reject) => {
    requestQueue.push({ resolve, reject, chunk });
    await handleRequestQueue();
  });
}

async function summarizeLargeText(text) {
  const chunks = splitText(text);
  const summaries = [];

  for (const chunk of chunks) {
    const summary = await summarizeChunk(chunk);
    summaries.push(summary);
    // Add an additional delay between chunk summaries
    await delay(500);
  }

  const finalSummary = await summarizeChunk(summaries.join(' '));
  return finalSummary;
}

async function summarizeYouTubeVideo(videoUrl) {
  const videoId = new URL(videoUrl).searchParams.get('v');
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  const text = transcript.map(item => item.text).join(' ');

  return await summarizeLargeText(text);
}

// GET route to show API is live
app.get('/', (req, res) => {
  res.send('API is running...');
});

// POST route for YouTube video summarization
app.post('/api/summarize', async (req, res) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    const summary = await summarizeYouTubeVideo(videoUrl);
    res.json({ summary });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred during summarization' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
