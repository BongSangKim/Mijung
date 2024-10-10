export function extractTimeInfo(text: string): { minutes: number } | null {
  const hourRegex = /(\d+)\s*시간/;
  const minuteRegex = /(\d+)\s*분/;
  const secondRegex = /(\d+)\s*초/;
  const rangeRegex = /(\d+)~(\d+)\s*(시간|분)/;

  let totalMinutes = 0;

  const hourMatch = text.match(hourRegex);
  const minuteMatch = text.match(minuteRegex);
  const secondMatch = text.match(secondRegex);
  const rangeMatch = text.match(rangeRegex);

  if (rangeMatch) {
    const start = parseInt(rangeMatch[1]);
    const end = parseInt(rangeMatch[2]);
    const unit = rangeMatch[3];
    const average = (start + end) / 2;
    totalMinutes = unit === '시간' ? average * 60 : average;
  } else {
    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1]) * 60;
    }
    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1]);
    }
    if (secondMatch) {
      totalMinutes += Math.round(parseInt(secondMatch[1]) / 60);
    }
  }

  return totalMinutes > 0 ? { minutes: totalMinutes } : null;
}
