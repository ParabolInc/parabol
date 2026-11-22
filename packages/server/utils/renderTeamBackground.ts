const DEFAULT_USE =
  'Use it to recognize the people, projects, systems, acronyms and recurring themes the material below refers to. It is context only: base your answer on the material below, and never use it to guess who wrote something.'

const renderTeamBackground = (teamBriefing: string | null | undefined, use = DEFAULT_USE) => {
  const briefing = teamBriefing?.trim()
  if (!briefing) return ''
  return `Team background, written from this team's earlier retrospectives. ${use}
<team_background>
${briefing}
</team_background>

`
}

export default renderTeamBackground
