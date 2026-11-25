import ms from 'ms'

const getInviteeMeetingsWindow = () => {
  const now = Date.now()
  return {
    meetingsAfter: new Date(now - ms('30d')).toISOString(),
    meetingsBefore: new Date(now + ms('1m')).toISOString()
  }
}

export default getInviteeMeetingsWindow
