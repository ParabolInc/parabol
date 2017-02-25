export const fromEpochSeconds = (int) => {
  return new Date(int * 1000);
};

export const toEpochSeconds = (maybeDate) => {
  const msFromEpoch = maybeDate instanceof Date ? maybeDate.getTime() : maybeDate;
  return Math.floor(msFromEpoch / 1000);
};
