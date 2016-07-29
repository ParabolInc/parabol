export default function makeMeetingUrl(teamId) {
  if (typeof window === 'undefined') return 'http://www.parabol.co';
  const {protocol, host} = window.location;
  return `${protocol}//${host}/meeting/${teamId}`;
}
