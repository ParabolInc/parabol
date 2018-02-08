// return a little noise so we never have a sort order conflict between tasks
export default function dndNoise() {
  return Math.random() / 1e20 - 5e-21;
}
