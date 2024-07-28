import { useState } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import Input from "./Input";
import "./App.css";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [summary, setSummary] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(event.target.value);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError("");
    setSummary("");
    try {
      const response = await axios.post("http://localhost:3000/api/summarize", {
        videoUrl,
      });
      setSummary(response.data.summary);
      setVideoUrl("");
    } catch (error) {
      setError("Failed to generate summary. Please try again.");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <h1 className="main-title">AI-Powered YouTube Video Summarizer</h1>

      <div className="input-wrapper">
        <Input
          searchQuery={videoUrl}
          onInputChange={handleInputChange}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </div>
      {summary && (
        <div className="output-wrapper">
            {isLoading && <div className="loading">Generating summary...</div>}
            {error && <div className="error">{error}</div>}
          <div className="markdown-wrapper">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
