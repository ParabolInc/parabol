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

  const owner = ownerName ? `${ownerName} (${ownerEmail})` : ownerEmail
  const page = pageName ? `this page in Parabol: ${pageName}` : 'a page in Parabol'

  return `
${owner} has invited you to ${pageAccess} ${page}

Open Page here: ${pageLink}

Your friends,
The Parabol Product Team
`
}

export default (props: PageSharedInviteProps) => {
  const subject = subjectLine(props.ownerName ?? props.ownerEmail)
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
