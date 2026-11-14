import {markdownToTipTap} from '../markdownToTipTap'
import {tipTapToMarkdown} from '../tipTapToMarkdown'

const roundTripPageLink = (attrs: Record<string, unknown>) => {
  const doc = {
    type: 'doc',
    content: [
      {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Host'}]},
      {type: 'pageLinkBlock', attrs}
    ]
  }
  return markdownToTipTap(tipTapToMarkdown(doc))?.find((node) => node.type === 'pageLinkBlock')
}

describe('pageLinkBlock markdown', () => {
  it('a synced page link survives a markdown round-trip', () => {
    const link = roundTripPageLink({
      pageCode: 7,
      title: 'Escalation path',
      canonical: true,
      synced: true
    })
    expect(link?.attrs).toMatchObject({
      pageCode: 7,
      title: 'Escalation path',
      canonical: true,
      synced: true
    })
  })

  it('an ordinary page link keeps a numeric pageCode through a markdown round-trip', () => {
    const link = roundTripPageLink({pageCode: 42, title: 'Runbook', canonical: true})
    expect(link?.attrs).toMatchObject({pageCode: 42, title: 'Runbook', canonical: true})
    expect(link?.attrs?.synced).toBeFalsy()
  })
})
