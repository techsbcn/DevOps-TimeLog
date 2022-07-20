export const getHoursFromMinutes = (minutes: number) => {
  return minutes / 60;
};

export const getMinutesFromHours = (hours: number) => {
  return hours * 60;
};

export const getHoursAndMinutes = (allMinutes: number) => {
  const hours = allMinutes / 60;
  const rhours = Math.floor(hours);
  const minutes = Math.floor((hours - rhours) * 60);
  return `${rhours}:${minutes > 10 ? minutes : '0' + minutes}`;
};

export const setTimeFormat = (totalTime: number) => {
  const minutesPerDay = 60 * 24;
  const days = Math.floor(totalTime / minutesPerDay);
  totalTime -= minutesPerDay * days;
  const hours = Math.floor(totalTime / 60);
  const minuts = Math.floor(totalTime % 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minuts}m`;
  } else {
    return `${hours}h ${minuts}m`;
  }
};
