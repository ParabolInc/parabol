import ReactDOMServer from 'react-dom/server'
import TeamInvite, {type TeamInviteProps} from './TeamInvite'

const subjectLine = (inviterName: string): string => `${inviterName} has invited you to Parabol`

const teamInviteText = (props: Omit<TeamInviteProps, 'title'>) => {
  const {inviteeName, inviteeEmail, inviterName, inviterEmail, inviteLink, teamName} = props
  return `
Hello ${inviteeName || inviteeEmail},

${inviterName} (${inviterEmail}) has invited you to join a team on Parabol: ${teamName}

Parabol is software for remote teams to run online retrospective and check-in meetings.

Get started here: ${inviteLink}

Your friends,
The Parabol Product Team
`
}

const teamInviteEmailCreator = (props: Omit<TeamInviteProps, 'title'>) => {
  const subject = subjectLine(props.inviterName)
  const rawHTML = ReactDOMServer.renderToStaticMarkup(<TeamInvite {...props} title={subject} />)
  const doctype =
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
  return {
    subject,
    body: teamInviteText(props),
    html: `${doctype}${rawHTML.replace(/<!DOCTYPE.*?>/, '')}`
  }
}

export default teamInviteEmailCreator
