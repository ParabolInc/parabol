export default function voidClick(e, cb) {
  e.preventDefault();
  if (typeof cb === 'function') {
    cb();
  }
}
