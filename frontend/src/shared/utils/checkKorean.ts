const checkKoreanRo = (name: string) => {
  const lastChar = name.charCodeAt(name.length - 1);
  const isThereLastChar = (lastChar - 0xac00) % 28;
  if (isThereLastChar) {
    return '으로';
  }
  return '로';
};

const checkKoreanIga = (name: string) => {
  const lastChar = name.charCodeAt(name.length - 1);
  const isThereLastChar = (lastChar - 0xac00) % 28;
  if (isThereLastChar) {
    return '이';
  }
  return '가';
};

export { checkKoreanRo, checkKoreanIga };
