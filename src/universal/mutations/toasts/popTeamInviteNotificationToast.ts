import AcceptTeamInviteMutation from 'universal/mutations/AcceptTeamInviteMutation'

interface Notification {
  inviter: {
    preferredName: string
  }
  team: {
    name: string
  }
  id: string
}

const popTeamInviteNotificationToast = (
  teamInviteNotification: Notification | null,
  {atmosphere, history}
) => {
  if (!teamInviteNotification) return
  const inviterName = teamInviteNotification.inviter && teamInviteNotification.inviter.preferredName
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
