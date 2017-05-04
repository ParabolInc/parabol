export default function targetIsDescendant(target, parent) {
  while (target !== document) {
    // if the target hits null before it hits the document, that means
    // its parent got unmounted, so give it the benefit of the doubt
    // if the id is portal, then we assume the parent spawned a portal
    if (target === parent || target === null || target.id === 'portal') return true;
    target = target.parentNode;
  }
  return false;
}

