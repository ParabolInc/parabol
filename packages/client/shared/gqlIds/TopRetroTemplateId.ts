const TopRetroTemplateId = {
  join: (teamId: string, retroTemplateId: string) =>
    `topRetroTemplate:${teamId}:${retroTemplateId}`,
  split: (id: string) => {
    const [, teamId, retroTemplateId] = id.split(':')
    return {teamId, retroTemplateId}
  }
}

export default TopRetroTemplateId
