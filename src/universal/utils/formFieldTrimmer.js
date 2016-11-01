export default function trim(data) {
  const trimmedData = {};
  const keys = Object.keys(data);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = data[key];
    trimmedData[key] = (typeof value === 'string') ? value.trim() : value;
  }
  return trimmedData;
}
