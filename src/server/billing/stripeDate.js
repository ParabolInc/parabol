export const fromStripeDate = (int) => {
  return new Date(int * 1000);
};

export const toStripeDate = (date) => {
  return Math.floor(date.getTime() / 1000);
}
