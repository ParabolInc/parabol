const isValidDate = (maybeDate) => {
  return !isNaN(maybeDate.getTime());
};

export default isValidDate;
