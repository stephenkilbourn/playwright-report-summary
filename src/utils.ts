function millisToMinuteSeconds(milliseconds: number) {
  const min = Math.floor(milliseconds / 60000);
  const sec = Math.ceil((milliseconds % 60000) / 1000);
  const minString = pad(min);
  const secString = pad(sec);

  if (milliseconds > 0) {
    if (milliseconds < 1000) {
      return '00:01 (mm:ss)';
    }
    if (sec < 10) {
      return `${minString}:${secString} (mm:ss)`;
    }
    return `${minString}:${secString} (mm:ss)`;
  }
  return '00:00 (mm:ss)';
}

function pad(value: number) {
  if (value < 10) {
    return `0${value}`;
  }
  return value;
}

export default millisToMinuteSeconds;
