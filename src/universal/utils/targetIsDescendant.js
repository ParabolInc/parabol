export default function targetIsDescendant(target, parent) {
  while (target) {
    if (target === parent) return true;
    target = target.parentNode;
  }
  return false;
};

