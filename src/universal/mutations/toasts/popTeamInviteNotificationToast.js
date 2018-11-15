import AcceptTeamInviteMutation from 'universal/mutations/AcceptTeamInviteMutation'

const popTeamInviteNotificationToast = (teamInviteNotification, {atmosphere, history}) => {
  const inviterName =
    teamInviteNotification &&
    teamInviteNotification.inviter &&
    teamInviteNotification.inviter.preferredName
  if (!inviterName) return
  const teamName = teamInviteNotification.team.name
  const notificationId = teamInviteNotification.id
  atmosphere.eventEmitter.emit('addToast', {
    autoDismiss: 10,
    title: 'You’re invited!',
    message: `${inviterName} would like you to join their team ${teamName}`,
    action: {
      label: 'Accept!',
      callback: () => {
        AcceptTeamInviteMutation(atmosphere, {notificationId}, {history})
      }
    }
  })
}

export default popTeamInviteNotificationToast
