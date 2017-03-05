export const normalizeExpiry = (value = '', previousValue = '') => {
  const month = value.substr(0, 2);
  // left pad
  if (month.length === 1 && month > 1) {
    return `0${month}/`;
  }
  // if backspacing or typing a month > 12
  if ((previousValue.length === 3 && value.length === 2) || parseInt(month, 10) > 12) {
    return value[0];
  }
  const numValue = value.replace(/[^\d]/g, '');
  if (numValue.length >= 2) {
    const prefix = `${numValue.substr(0, 2)}/`;
    const year = numValue.substr(2);
    const currentYear = String((new Date()).getFullYear()).substr(2);
    // only 201x+
    if (year.length === 0 || year.length === 1 && year < currentYear[0]) {
      return prefix;
    }
    // only 2017+
    if (year.length > 0 && year < currentYear) {
      return `${prefix}${year[0]}`;
    }
    // final value
    return `${prefix}${numValue.substr(2)}`;
  }
  // correct month (october+)
  return value;
};

export const normalizeNumeric = (value) => value.replace(/[^\d]/g, '');
