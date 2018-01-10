let tempId = 0;

const clientTempId = (prefix) => {
  const prefixWithSeparator = prefix ? `${prefix}::` : '';
  return `${prefixWithSeparator}${tempId++}-tmp`;
};

export default clientTempId;
