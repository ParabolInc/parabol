export default function shuffle(arr) {
  let m = arr.length;
  while (m) {
    const i = (Math.random() * m--) >>> 0;
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr;
}
