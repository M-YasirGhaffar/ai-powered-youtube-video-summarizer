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
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}`, {
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
    <div className="app max-w-full mx-auto p-8 text-gray-200">
      <h1 className="main-title text-center text-5xl text-gray-300">AI-Powered YouTube Video Summarizer</h1>
      <div className="input-wrapper my-4">
        <Input
          searchQuery={videoUrl}
          onInputChange={handleInputChange}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </div>
      {summary && (
        <div className="output-wrapper flex justify-center items-center">
          {error && <div className="error text-lg text-red-500">{error}</div>}
          <div className="markdown-wrapper mx-auto bg-[#222222] my-4 p-8">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
