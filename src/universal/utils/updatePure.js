export default function updatePure(props, nextProps) {
  const nextPropKeys = Object.keys(nextProps);
  for (let i = 0; i < nextPropKeys.length; i++) {
    const key = nextPropKeys[i];
    if (props[key] !== nextProps[key]) {
      return true;
    }
  }
  return false;
}
