export default function getLocalPhase(pathname, teamId) {
  const pathnameArray = pathname.split('/');
  const teamIdIdx = pathnameArray.indexOf(teamId);
  return pathnameArray[teamIdIdx + 1];
}
