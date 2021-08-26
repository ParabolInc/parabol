import makeHref from './makeHref'

const getMassInvitationUrl = (token: string) => {
  const {prblIn} = window.__ACTION__
  const protocol = prblIn.startsWith('localhost') ? 'http:' : 'https:'
  return __PRODUCTION__ ? `${protocol}//${prblIn}/${token}` : makeHref(`/invitation-link/${token}`)
}

export default getMassInvitationUrl
