// import { Chat } from "@/components/Chat";
// import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { GenerateImg } from "./api/chat";
// import { writeFileSync } from "fs";
import { saveAs } from 'file-saver';
// const { writeFileSync } = require('fs');
import axios from "axios";

// firebase 관련 모듈을 불러옵니다.

import { app, db, auth } from "@/firebase";
import {
  collection,
  query,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  where,
} from "firebase/firestore";

import {
  getStorage,
  ref,
  // uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  uploadBytes,
  uploadString,
} from "firebase/storage";

const imgCollection = collection(db, "urls");
// const imgStorage = getStorage(app, "storage 주소");

export default function Home(storage) {
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
    console.log("GENERATING ...");
    
    const { Configuration, OpenAIApi } = require("openai");
    const configuration = new Configuration({
      organization: 'org-QJcVnKQ7TKqjkxoj3aDY3uHO',
      apiKey: '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',
    });
    delete configuration.baseOptions.headers['User-Agent'];
    const openai = new OpenAIApi(configuration);
    const imgResponse = await openai.createImage({
      prompt:JSON.stringify(response.content),
      n:1,
      size: "256x256",
      response_format: 'b64_json',
    })

    const blob = b64toBlob(imgResponse.data.data[0].b64_json);
    uploadImgToStorage(blob);
  };

  const b64toBlob = (base64Image) => {
    const byteCharacters = atob(base64Image);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const arrayBuffer = byteArray.buffer;
    return new Blob([arrayBuffer], { type: 'image/jpeg' });
  }

  const uploadImgToStorage = async (imageBlob) => {
    var storage = getStorage(app);
    var filename = 'cat.jpg';
    var storageRef = ref(storage, "images/" + filename);
    // uploadBytes(storageRef, imageBlob, { contentType: 'image/jpeg' });
    var uploadTask = uploadBytes(storageRef, imageBlob, { contentType: 'image/jpeg' });
    uploadTask
      .then((snapshot) => {
        console.log("Image uploaded successfully");

        // Retrieve the publicly accessible URL of the uploaded image
        getDownloadURL(snapshot.ref).then((downloadURL) => {
          console.log("Image download URL:", downloadURL);
          setImageContainer(downloadURL);
          // Do something with the downloadURL, such as saving it to a database
        });
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
      });
  };

  const setImageContainer = (url) => {
    const imageContainer = document.getElementById('image-container');
    const imgElement = document.createElement('img');
    imgElement.src = url;
    if (imageContainer.firstChild != null) imageContainer.firstChild.remove();
    imageContainer.appendChild(imgElement);
  }

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
      <div id="image-container"></div>
    </div>
  );
}