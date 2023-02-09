export default function getContentGroup(pathname: string) {
  // ^action\.parabol\.co/(meet|new-meeting|retro)(/|$|\?)
  if (pathname.match(/^\/(meet|meetings|new-meeting|retro)(\/|$\?)/)) {
    return 'Meetings'
  } else if (pathname.match(/^\/(team|new-summary)(\/|$|\?)/)) {
    return 'Team'
  } else if (pathname.match(/^\/retrospective-demo/)) {
    return 'Demo'
  } else if (pathname.match(/^\/(invitation-link|team-invitation)\//)) {
    return 'Invitations'
  } else if (pathname.match(/^\/(me(\/tasks)?($|\?))/)) {
    return 'Personal'
  } else if (pathname.match(/^\/(me\/(profile|organizations)|newteam)(\/|$|\?)/)) {
    return 'Settings'
  } else if (
    pathname.match(
      /^\/($|\?|(auth|signin|signout|(reset|forgot)-password|create-account|saml-redirect|invitation-required)(\/|$|\?))/
    )
  ) {
    return 'Account'
  } else {
    return undefined
  }
}
