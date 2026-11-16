import ReactDOMServer from 'react-dom/server'
import PageAccessRequest, {type PageAccessRequestProps, pageRoles} from './PageAccessRequest'

const subjectLine = (requesterName: string, isSyncedBlock: boolean): string =>
  isSyncedBlock
    ? `${requesterName} wants to view a synced block on Parabol`
    : `${requesterName} has requested access to a Page on Parabol`

const plaintext = (props: Omit<PageAccessRequestProps, 'title'>) => {
  const {requesterName, requesterEmail, pageName, pageLink, role, reason, isSyncedBlock} = props
  const pageAccess = pageRoles[role] || 'view'

  const requester = requesterName ? `${requesterName} (${requesterEmail})` : requesterEmail
  const reasonBlock = reason ? `${reason}`.replace(/^/gm, '| ') : ''
  const headline = isSyncedBlock
    ? `${requester} wants to view the synced block ${pageName}.`
    : `${requester} has requested to ${pageAccess} ${pageName ? `this page in Parabol: ${pageName}` : 'a page in Parabol'}`

  return `
${headline}
${reasonBlock}

Review the Page permissions here: ${pageLink}

Your friends,
The Parabol Product Team
`
}

const pageAccessRequestEmailCreator = (props: Omit<PageAccessRequestProps, 'title'>) => {
  const subject = subjectLine(props.requesterName ?? props.requesterEmail, props.isSyncedBlock)
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
