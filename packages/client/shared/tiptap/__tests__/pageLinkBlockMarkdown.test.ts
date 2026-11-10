import {markdownToTipTap} from '../markdownToTipTap'
import {tipTapToMarkdown} from '../tipTapToMarkdown'

describe('pageLinkBlock markdown', () => {
  it('a synced page link survives a markdown round-trip', () => {
    const doc = {
      type: 'doc',
      content: [
        {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Host'}]},
        {
          type: 'pageLinkBlock',
          attrs: {pageCode: 7, title: 'Escalation path', canonical: true, synced: true}
        }
      ]
    }
    const link = markdownToTipTap(tipTapToMarkdown(doc))?.find(
      (node) => node.type === 'pageLinkBlock'
    )
    expect(link?.attrs).toMatchObject({
      pageCode: '7',
      canonical: true,
      synced: true
    })
  })
})
