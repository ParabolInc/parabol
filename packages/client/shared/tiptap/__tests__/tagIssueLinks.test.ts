import {markdownToTipTap} from '../markdownToTipTap'
import tagIssueLinks from '../tagIssueLinks'

const PULL_REQUEST_URL = 'https://github.com/ParabolInc/parabol/pull/13615'
const ISSUE_URL = 'https://parabol.atlassian.net/browse/PAR-812'
const serviceByUrl = new Map([
  [PULL_REQUEST_URL, 'github'],
  [ISSUE_URL, 'jira']
])

const getServiceByLinkText = (markdown: string) => {
  const doc = tagIssueLinks({type: 'doc', content: markdownToTipTap(markdown)}, serviceByUrl)
  const serviceByLinkText: Record<string, string | undefined> = {}
  const collectLinks = (node: typeof doc) => {
    const link = node.marks?.find((mark) => mark.type === 'link')
    if (link && node.text) serviceByLinkText[node.text] = link.attrs?.issueService
    node.content?.forEach(collectLinks)
  }
  collectLinks(doc)
  return serviceByLinkText
}

describe('tagIssueLinks', () => {
  it('names the service of each link to an issue', () => {
    const serviceByLinkText = getServiceByLinkText(
      `Shipped [#13615 faster dev stack](${PULL_REQUEST_URL}) and reviewed [PAR-812](${ISSUE_URL}).`
    )
    expect(serviceByLinkText).toEqual({'#13615 faster dev stack': 'github', 'PAR-812': 'jira'})
  })

  it('reaches links nested in a list', () => {
    const serviceByLinkText = getServiceByLinkText(
      `- Merged [#13615](${PULL_REQUEST_URL})\n- Nothing else`
    )
    expect(serviceByLinkText).toEqual({'#13615': 'github'})
  })

  it('leaves other links alone', () => {
    const serviceByLinkText = getServiceByLinkText(
      'Notes are in the [handbook](https://example.com/handbook).'
    )
    expect(serviceByLinkText).toEqual({handbook: undefined})
  })

  it('leaves a link that shows its own URL alone', () => {
    const serviceByLinkText = getServiceByLinkText(
      `See [${PULL_REQUEST_URL}](${PULL_REQUEST_URL}).`
    )
    expect(serviceByLinkText).toEqual({[PULL_REQUEST_URL]: undefined})
  })

  it('keeps the rest of the link', () => {
    const doc = tagIssueLinks(
      {type: 'doc', content: markdownToTipTap(`[#13615](${PULL_REQUEST_URL})`)},
      serviceByUrl
    )
    const link = doc.content?.[0]?.content?.[0]?.marks?.[0]
    expect(link?.attrs).toMatchObject({href: PULL_REQUEST_URL, issueService: 'github'})
  })
})
