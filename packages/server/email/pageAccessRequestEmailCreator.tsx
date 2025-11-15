import ReactDOMServer from 'react-dom/server'
import PageAccessRequest, {type PageAccessRequestProps, pageRoles} from './PageAccessRequest'

const subjectLine = (requesterName: string): string =>
  `${requesterName} has requested access to a Page on Parabol`

const plaintext = (props: Omit<PageAccessRequestProps, 'title'>) => {
  const {requesterName, requesterEmail, pageName, pageLink, role, reason} = props
  const pageAccess = pageRoles[role] || 'view'

  const requester = requesterName ? `${requesterName} (${requesterEmail})` : requesterEmail
  const page = pageName ? `this page in Parabol: ${pageName}` : 'a page in Parabol'

  const reasonBlock = reason ? `${reason}`.replace(/^/gm, '| ') : ''

  return `
${requester} has requested to ${pageAccess} ${page}
${reasonBlock}

Review the Page permissions here: ${pageLink}

Your friends,
The Parabol Product Team
`
}

const pageAccessRequestEmailCreator = (props: Omit<PageAccessRequestProps, 'title'>) => {
  const subject = subjectLine(props.requesterName ?? props.requesterEmail)
  const rawHTML = ReactDOMServer.renderToStaticMarkup(
    <PageAccessRequest {...props} title={subject} />
  )
  const doctype =
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
  const html = `${doctype}${rawHTML.replace(/<!DOCTYPE.*?>/, '')}`

  return {
    subject,
    body: plaintext(props),
    html
  }
}
export default pageAccessRequestEmailCreator
