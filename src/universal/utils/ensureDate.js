import isValidDate from 'universal/utils/isValidDate';

const ensureDate = (maybeDate) => {
  const date = new Date(maybeDate);
  return isValidDate(date) ? date : new Date();
};

export default ensureDate;
