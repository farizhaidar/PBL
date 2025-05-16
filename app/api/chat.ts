// pages/api/chat.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { prompt } = req.body;  // Ganti 'message' menjadi 'prompt'

  try {
    const response = await fetch("https://n8n.akmalnurwahid.my.id/webhook/bank-chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),  // Kirim prompt
    });

    let data;
    try {
      data = await response.json();
    } catch {
      
    }

    // Tambahkan log untuk memeriksa data dari chatbot
    console.log("Chatbot Response:", data);

    res.status(200).json({
      reply: data.output || data.reply || data.text || "Bot tidak memberikan jawaban.",
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ reply: "Maaf, terjadi kesalahan pada server." });
  }
}
