export const speak = (text: string, lang: string = 'ko-KR') => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // 말하기 속도 조절 (0.1 ~ 10)
    window.speechSynthesis.speak(utterance);
  } else {
    console.error('이 브라우저는 음성 합성을 지원하지 않습니다.');
  }
};

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
