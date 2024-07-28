require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { CohereClient } = require('cohere-ai');
const { YoutubeTranscript } = require('youtube-transcript');

const app = express();
app.use(express.json());
app.use(cors());

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const MAX_CHUNK_SIZE = 75000;
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 60000;

function chunkText(text) {
  const chunks = [];
  while (text.length > 0) {
    if (text.length <= MAX_CHUNK_SIZE) {
      chunks.push(text);
      break;
    }
    let chunk = text.substr(0, MAX_CHUNK_SIZE);
    let lastPeriod = Math.max(chunk.lastIndexOf('.'), chunk.lastIndexOf('\n'));
    if (lastPeriod > 0) {
      chunk = text.substr(0, lastPeriod + 1);
    }
    chunks.push(chunk);
    text = text.substr(chunk.length);
    console.log('Chunk:', chunk);
  }
  return chunks;
}

async function summarizeChunk(chunk) {
  try {
    const response = await cohere.summarize({
      text: chunk,
      length: 'auto',
      format: 'auto',
      model: 'command',
      extractiveness: 'auto',
      temperature: 0.3,
    });
    return response.summary;
  } catch (error) {
    console.error('Error in summarization:', error);
    throw error;
  }
}

async function summarizeLargeText(text) {
  const chunks = chunkText(text);
  let summaries = [];
  
  for (let i = 0; i < chunks.length; i++) {
    if (i > 0 && i % RATE_LIMIT === 0) {
      console.log(`Rate limit reached. Waiting for ${RATE_LIMIT_WINDOW / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_WINDOW));
    }
    const summary = await summarizeChunk(chunks[i]);
    summaries.push(summary);
  }
  
  return summaries;
}

async function combineSummaries(summaries) {
  try {

    const customPrompt = `
    Combine the following chunks of summaries into a single well-formatted Markdown text. 
    Do not further summarize the text, just combine and format it properly.\n
    Summaries:
    ${summaries.join('\n\n')}`;

    const response = await cohere.generate({
      model: 'command',
      prompt: customPrompt,
      temperature: 0.3,
    });
    return response.generations[0].text;
  } catch (error) {
    console.error('Error in combining summaries:', error);
    throw error;
  }
}

async function getYouTubeTranscript(videoUrl) {
  const videoId = new URL(videoUrl).searchParams.get('v');
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  return transcript.map(item => item.text).join(' ');
}

app.post('/api/summarize', async (req, res) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    const transcript = await getYouTubeTranscript(videoUrl);
    const summaries = await summarizeLargeText(transcript);
    
    let finalSummary;
    if (summaries.length > 1) {
      finalSummary = await combineSummaries(summaries);
    } else {
      finalSummary = summaries[0];
    }

    res.json({ summary: finalSummary });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred during summarization' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
