import {generateText} from '@tiptap/core'
import {serverTipTapExtensions} from '../serverTipTapExtensions'

const docWithPageLink = (title: string) => ({
  type: 'doc',
  content: [
    {type: 'paragraph', content: [{type: 'text', text: 'Summaries'}]},
    {type: 'pageLinkBlock', attrs: {pageCode: 1917882336, title}}
  ]
})

describe('pageLinkBlock plain text', () => {
  it('renders the linked page title without link markup', () => {
    const text = generateText(docWithPageLink('Standup - Oct 19, 2026'), serverTipTapExtensions)
    expect(text).toBe('Summaries\n\nStandup - Oct 19, 2026')
  })

  it('falls back to the untitled label', () => {
    const text = generateText(docWithPageLink(''), serverTipTapExtensions)
    expect(text).toBe('Summaries\n\n<Untitled>')
  })
})

describe('synced pageLinkBlock plain text', () => {
  const syncedLink = (synced: boolean) => ({
    type: 'doc',
    content: [
      {
        type: 'pageLinkBlock',
        attrs: {pageCode: 7, title: 'Escalation', synced, canonical: true}
      }
    ]
  })

  it('renders no text for a synced link', () => {
    expect(generateText(syncedLink(true), serverTipTapExtensions)).not.toContain('Escalation')
  })

  it('still renders a page link title', () => {
    expect(generateText(syncedLink(false), serverTipTapExtensions)).toContain('Escalation')
  })
})
