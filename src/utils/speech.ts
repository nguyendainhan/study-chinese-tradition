export function speakTaiwanMandarin(text: string, rate: number = 0.9) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-TW';
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const twVoice =
    voices.find((v) => v.lang === 'zh-TW' || v.lang === 'zh_TW') ||
    voices.find((v) => v.lang.toLowerCase().includes('tw')) ||
    voices.find((v) => v.lang.toLowerCase().includes('zh'));

  if (twVoice) {
    utterance.voice = twVoice;
  }
  window.speechSynthesis.speak(utterance);
}

