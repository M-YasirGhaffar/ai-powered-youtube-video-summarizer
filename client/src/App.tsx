import { useState } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import Input from "./Input";
import "./App.css";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [summary, setSummary] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(event.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/summarize", {
        videoUrl,
      });
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="app">
      <div className="input-wrapper">
        <Input
          searchQuery={videoUrl}
          onInputChange={handleInputChange}
          onSearch={handleSearch}
        />
      </div>
      {summary && (
        <div className="output-wrapper">
          <div className="markdown-wrapper">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
