export default function makeUsername(preferredName) {
  return typeof preferredName === 'string' ? preferredName.replace(/\s+/g, '') : 'UnknownUser';
};
