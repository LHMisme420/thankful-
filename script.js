const bundlr = new Bundlr("https://node2.bundlr.network", "arweave", window.arweaveWallet || null);
// Fallback for no wallet — uses free credits via dev faucet
if (!window.arweaveWallet) {
  bundlr.utils.getBundlerAddress = () => "https://devnet.bundlr.network";
}

const status = document.getElementById("status");
const sendBtn = document.getElementById("sendBtn");
const messageEl = document.getElementById("message");
const voiceBtn = document.getElementById("voiceBtn");

let recognition = null;
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = navigator.language || 'en-US';
}

voiceBtn.addEventListener("mousedown", () => {
  if (!recognition) return status.textContent = "Speech not supported here, type instead ❤️";
  recognition.start();
  voiceBtn.textContent = "🎙️ Listening…";
});
voiceBtn.addEventListener("mouseup", () => recognition && recognition.stop());
voiceBtn.addEventListener("touchstart", e => { e.preventDefault(); recognition && recognition.start(); });
voiceBtn.addEventListener("touchend", e => { e.preventDefault(); recognition && recognition.stop(); });

if (recognition) {
  recognition.onresult = e => messageEl.value = e.results[0][0].transcript;
  recognition.onend = () => voiceBtn.textContent = "🎙️ Hold to speak";
}

sendBtn.onclick = async () => {
  const message = messageEl.value.trim();
  if (!message) return status.textContent = "Say something real ❤️";

  status.textContent = "Sending your thanks into eternity…";

  const tags = [
    { name: "App", value: "thankful-protocol" },
    { name: "Year", value: "2025" },
    { name: "Type", value: "gratitude" },
    { name: "Timestamp", value: Date.now().toString() }
  ];

  try {
    const tx = await bundlr.upload(message, { tags });
    status.innerHTML = `Forever. <a href="https://arweave.net/${tx.id}" target="_blank">arweave.net/${tx.id}</a> 🦃✨`;
    messageEl.value = "";
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  } catch (e) {
    status.textContent = "Free tier full — still free on devnet, or fund 0.01 AR for unlimited 🦃";
  }
};
