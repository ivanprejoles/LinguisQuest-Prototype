// utils/playTagalogTTS.ts
export const playTagalogSpeech = (text: string) => {
  const encodedText = encodeURIComponent(text);
  // Free Google Translate TTS URL configured for Tagalog ('tl')
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=tl&client=tw-ob`;

  const audio = new Audio(url);
  audio.play().catch((err) => {
    console.error("Audio playback error:", err);
  });
};