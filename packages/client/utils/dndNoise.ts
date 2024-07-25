// DEPRECATED. Sorting by floats has resulted in a lot of bugs. Please use sortOrder.ts & sort lexicographically
// return a little noise so we never have a sort order conflict between tasks
export default function dndNoise() {
  return Math.random() / 1e15 - 5e-16
}
