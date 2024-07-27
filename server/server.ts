import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { YoutubeTranscript } from 'youtube-transcript';

dotenv.config();

const app = express();
const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Middleware
app.use(express.json());
app.use(cors());

// Helper function to add delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to split text into chunks
function splitText(text: string, chunkSize = 5000): string[] {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
    console.log('Chunk:', chunks[chunks.length - 1]);
  }
  console.log('Total chunks:', chunks.length);
  return chunks;
}

// Function to summarize a chunk of text with delay
async function summarizeChunk(chunk: string): Promise<string> {
  const model = genAi.getGenerativeModel({ model: "gemini-1.5-pro-001" });
  const result = await model.generateContent(`Summarize the following text:\n\n${chunk}`);
  
  // Add a delay of 1 second (1000 ms) after each API call
  await delay(1000);
  
  console.log('Summary:', result.response.text());
  return result.response.text();
}

// Function to summarize large text
async function summarizeLargeText(text: string): Promise<string> {
  const chunks = splitText(text);
  const summaries = [];
  
  for (const chunk of chunks) {
    const summary = await summarizeChunk(chunk);
    summaries.push(summary);
    // Add an additional delay between chunk summaries
    await delay(500);
  }
  
  const finalSummary = await summarizeChunk(summaries.join(" "));
  return finalSummary;
}

// Function to handle YouTube video summarization
async function summarizeYouTubeVideo(videoUrl: string): Promise<string> {
  const videoId = new URL(videoUrl).searchParams.get('v');
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  const text = transcript.map((item: { text: string }) => item.text).join(' ');
  
  return await summarizeLargeText(text);
}

// GET route to show API is live
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// POST route for YouTube video summarization
app.post('/api/summarize', async (req: Request, res: Response) => {
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