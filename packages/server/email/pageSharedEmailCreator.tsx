import Oy from 'oy-vey'
import PageSharedInvite, {
  type PageSharedInviteProps,
  pageRoles
} from 'parabol-client/modules/email/components/PageSharedInvite'
import {headCSS} from 'parabol-client/modules/email/styles'

const subjectLine = (ownerName: string): string =>
  `${ownerName} has shared a Page with you on Parabol`

const teamInviteText = (props: PageSharedInviteProps) => {
  const {ownerName, ownerEmail, pageName, pageLink, role} = props
  const pageAccess = pageRoles[role] || 'view'
  return `
${ownerName} (${ownerEmail}) has invited you to ${pageAccess} this page in Parabol: ${pageName}

Open Page here: ${pageLink}

Your friends,
The Parabol Product Team
`
}

export default (props: PageSharedInviteProps) => {
  const subject = subjectLine(props.ownerName)
  return {
    subject,
    body: teamInviteText(props),
    html: Oy.renderTemplate(<PageSharedInvite {...props} />, {
      headCSS,
      title: subject,
      previewText: subject
    })
  }
}
