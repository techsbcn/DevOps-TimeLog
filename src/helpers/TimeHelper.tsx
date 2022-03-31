export const getHoursFromMinutes = (minutes: number) => {
  return minutes / 60;
};

export const getMinutesFromHours = (hours: number) => {
  return hours * 60;
};

export const getHoursAndMinutes = (allMinutes: number) => {
  const hours = allMinutes / 60;
  const rhours = Math.floor(hours);
  const minutes = (hours - rhours) * 60;
  return `${rhours}:${minutes > 10 ? minutes : '0' + minutes}`;
};
