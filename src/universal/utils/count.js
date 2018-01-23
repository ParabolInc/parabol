/**
 * Returns an iterator for the infinite series `start`, `start + 1`, ... inf
 */
export default function* count(start = 0) {
  let val = start;
  while (true) {
    yield val++;
  }
}
