import makeHref from './makeHref'

const getMassInvitationUrl = (token: string) => {
    return __PRODUCTION__
      ? `https://${window.__ACTION__.prblIn}/${token}`
      : makeHref(`/invitation-link/${token}`)
  }

  export default getMassInvitationUrl
