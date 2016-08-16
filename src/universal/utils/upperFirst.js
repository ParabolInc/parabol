export default function upperFirst(string) {
  const upperFirstString = string.charAt(0).toUpperCase() + string.slice(1);
  return upperFirstString;
}
