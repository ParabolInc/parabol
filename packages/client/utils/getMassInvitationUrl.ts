import makeHref from './makeHref'

const getMassInvitationUrl = (token: string) => {
  const {prblIn} = window.__ACTION__
  const {protocol} = window.location
  return prblIn ? `${protocol}//${prblIn}/${token}` : makeHref(`/invitation-link/${token}`)
}

export default getMassInvitationUrl
