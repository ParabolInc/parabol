const TeamNotificationSettingsId = {
  join: (id: number) => `teamNotificationSettings:${id}`,
  split: (id: string) => parseInt(id.split(':')[1]!)
}

export default TeamNotificationSettingsId
