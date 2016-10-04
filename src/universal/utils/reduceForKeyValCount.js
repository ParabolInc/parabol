export default function reduceForKeyValCount(arr, key, val) {
  return arr.reduce((p, c) => {
    if (c[key] === val) {
      p++;
    }
    return p;
  }, 0);
}
