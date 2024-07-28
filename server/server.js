require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { YoutubeTranscript } = require('youtube-transcript');

const app = express();
app.use(express.json());
app.use(cors());

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function summarizeTranscript(transcript) {
  try {
    const prompt = `
    Create very detailed notes of the below transcript with highlighting all the important information with headings and bullet points as well, remember to keep it well formatted:\n
    ${transcript}`;

    // console.log(transcript)

    console.log('Prompt:', prompt);

    const model = genAi.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    // const summary = await response.text();
    return response.text();
    // return summary.trim();
  } catch (error) {
    console.error('Error in summarizing transcript:', error);
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
    const summary = await summarizeTranscript(transcript);

    res.json({ summary });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred during summarization' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
