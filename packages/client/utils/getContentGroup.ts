const CONTENT_GROUP_PREFIX = `App |`
export default function getContentGroup(pathname: string) {
  let contentGroup
  // ^action\.parabol\.co/(meet|new-meeting|retro)(/|$|\?)
  if (pathname.match(/^\/(meet|meetings|new-meeting|retro)(\/|$\?)/)) {
    contentGroup = 'Meetings'
  } else if (pathname.match(/^\/(team|new-summary)(\/|$|\?)/)) {
    contentGroup = 'Team'
  } else if (pathname.match(/^\/retrospective-demo/)) {
    contentGroup = 'Demo'
  } else if (pathname.match(/^\/(invitation-link|team-invitation)\//)) {
    contentGroup = 'Invitations'
  } else if (pathname.match(/^\/(me(\/tasks)?($|\?))/)) {
    contentGroup = 'Personal'
  } else if (pathname.match(/^\/(me\/(profile|organizations)|newteam)(\/|$|\?)/)) {
    contentGroup = 'Settings'
  } else if (
    pathname.match(
      /^\/($|\?|(auth|signin|signout|(reset|forgot)-password|create-account|saml-redirect|invitation-required)(\/|$|\?))/
    )
  ) {
    contentGroup = 'Account'
  } else {
    return undefined
  }
  return `${CONTENT_GROUP_PREFIX} ${contentGroup}`
}
