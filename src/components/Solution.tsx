"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function Solution() {
  const imageLink = "https://mintlify-assets.b-cdn.net/interview/base64.txt";
  const [base64Image, setBase64Image] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const decodeMessage = (imageElement: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Verify first 4 pixels have remainders 0,1,2,3
    for (let i = 0; i < 4; i++) {
      const sum = data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2];
      const remainder = sum % 4;
      if (remainder !== i) {
        console.error("Invalid pixel pattern");
        return;
      }
    }

    // Start collecting bits from the 5th pixel
    let binaryString = "";
    for (let i = 4; i < data.length / 4; i++) {
      const sum = data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2];
      const remainder = sum % 4;

      // Convert remainder to 2 bits
      switch (remainder) {
        case 0:
          binaryString += "00";
          break;
        case 1:
          binaryString += "01";
          break;
        case 2:
          binaryString += "10";
          break;
        case 3:
          binaryString += "11";
          break;
      }
    }

    // Convert binary to ASCII
    let decodedMessage = "";
    for (let i = 0; i < binaryString.length; i += 8) {
      const byte = binaryString.substring(i, i + 8);
      if (byte.length === 8) {
        const charCode = parseInt(byte, 2);
        decodedMessage += String.fromCharCode(charCode);
      }
    }

    setMessage(decodedMessage);
  };

  useEffect(() => {
    const getImage = async () => {
      try {
        const base64Data = await axios.get(imageLink);
        setBase64Image(base64Data.data);

        // Create an image element and decode once loaded
        const img = new Image();
        img.onload = () => decodeMessage(img);
        img.src = `data:image/png;base64,${base64Data.data}`;
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };
    getImage();
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} className='hidden' />
      {base64Image && (
        <div className='flex flex-col items-center py-16 gap-8'>
          <h1 className='text-5xl font-bold'>The Solution</h1>
          <img
            src={`data:image/png;base64,${base64Image}`}
            alt='Base64 PNG'
            className='w-1/2 h-auto'
          />
          {message && (
            <div className='whitespace-pre-wrap'>
              <h3>Decoded Message:</h3>
              <p>{message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
