export const sortOrgTeams = async (teams, sortType, dataLoader) => {
  if (sortType === 'name') {
    return teams.sort((a, b) => a.name.localeCompare(b.name))
  }

  if (sortType === 'lastMetAt') {
    const teamsWithMeetingData = await Promise.all(
      teams.map(async (team) => {
        const [completedMeetings, activeMeetings] = await Promise.all([
          dataLoader.get('completedMeetingsByTeamId').load(team.id),
          dataLoader.get('activeMeetingsByTeamId').load(team.id)
        ])

        const allMeetingDates = [
          ...completedMeetings.map((meeting) => new Date(meeting.endedAt || meeting.createdAt)),
          ...activeMeetings.map((meeting) => new Date(meeting.createdAt))
        ]

        const lastMetAt =
          allMeetingDates.length > 0
            ? new Date(Math.max(...allMeetingDates.map((date) => date.getTime())))
            : null

        return {
          ...team,
          lastMetAt
        }
      })
    )

    return teamsWithMeetingData.sort((a, b) => {
      if (!a.lastMetAt && !b.lastMetAt) return 0
      if (!a.lastMetAt) return 1
      if (!b.lastMetAt) return -1
      return b.lastMetAt.getTime() - a.lastMetAt.getTime()
    })
  }

  return teams
}
