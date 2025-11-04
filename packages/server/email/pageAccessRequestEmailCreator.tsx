import ReactDOMServer from 'react-dom/server'
import PageAccessRequest, {type PageAccessRequestProps, pageRoles} from './PageAccessRequest'

const subjectLine = (ownerName: string): string =>
  `${ownerName} has shared a Page with you on Parabol`

const teamInviteText = (props: Omit<PageAccessRequestProps, 'title'>) => {
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

const pageSharedEmailCreator = (props: Omit<PageAccessRequestProps, 'title'>) => {
  const subject = subjectLine(props.ownerName ?? props.ownerEmail)
  const rawHTML = ReactDOMServer.renderToStaticMarkup(
    <PageAccessRequest {...props} title={subject} />
  )
  const doctype =
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
  const html = `${doctype}${rawHTML.replace(/<!DOCTYPE.*?>/, '')}`

  return {
    subject,
    body: teamInviteText(props),
    html
  }
}
export default pageSharedEmailCreator
