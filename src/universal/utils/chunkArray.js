/**
 * Splits an array into chunks of the specified size.
 * E.g. chunkArray([1, 2, 3, 4, 5], 2) === [[1, 2], [3, 4], [5]]
 */
export default function chunkArray(array, chunkSize) {
  if (!Array.isArray(array)) {
    throw new Error('First argument `array` must be an Array.');
  }
  if (typeof chunkSize !== 'number') {
    throw new Error('Second argument `chunkSize` must be a Number.');
  }
  if (chunkSize < 1) {
    throw new Error('Chunk size must be greater than 0.');
  }
  const numChunks = Math.ceil(array.length / chunkSize);
  const chunks = [];
  for (let chunk = 0; chunk < numChunks; chunk++) {
    const chunkIndex = chunk * chunkSize;
    chunks.push(array.slice(chunkIndex, chunkIndex + chunkSize));
  }
  return chunks;
}
