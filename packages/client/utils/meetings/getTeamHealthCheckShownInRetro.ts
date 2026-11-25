// a retro shows its Team Health check while the retro runs, and its results once revealed. A check
// still open after the retro ends belongs to its own page, so the retro links there instead
const getTeamHealthCheckShownInRetro = <Check extends {readonly endedAt?: string | null}>(retro: {
  readonly endedAt?: string | null
  readonly teamHealthMeeting?: Check | null
}) => {
  const {endedAt, teamHealthMeeting} = retro
  if (!teamHealthMeeting) return null
  return !endedAt || teamHealthMeeting.endedAt ? teamHealthMeeting : null
}

export default getTeamHealthCheckShownInRetro
