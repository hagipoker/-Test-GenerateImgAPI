// import { Chat } from "@/components/Chat";
// import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { GenerateImg } from "./api/chat";

import { Configuration, OpenAIApi } from "openai";


export default function Home() {
  const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  const openai = new OpenAIApi(configuration);

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState();
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [response, setResponse] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!content) return;

    handleResponse({ role: "user", content: content});
  }
  
  const handleResponse = async (inputMessage) => {
    const updatedMessages = [inputMessage];
    setMessages(updatedMessages);

    const response = await fetch("/api/chat", {
      method:"POST",
      headers: {"Content-Type":"application/json",},
      body: JSON.stringify({ messages: updatedMessages.slice(-2), }),
    });

    if (!response.ok) throw new Error(response.statusText);

    const result = await response.json();
    setResponse(result);

    if (!result) return;

    setContent("");

    console.log(result);
  }

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
    }
  }, [content]);


  const GenerateImg = async () => {
    const imgResponse = await openai.createImage({
      prompt: JSON.stringify(response.content),
      n:1,
      size: "256x256",
    });
    console.log(imgResponse.data.data[0].url);
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        className="min-h-[44px] rounded-lg pl-4 pr-12 py-2 w-full focus:outline-none focus:ring-1 focus:ring-neutral-300 border-2 border-neutral-200"
        style={{ resize: "none" }}
        placeholder="메시지를 입력하세요"
        value={content}
        rows={1}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <div>
        {response.content}
      </div>
      <button onClick={GenerateImg}>Generate Image</button>
    </div>
  );
}
