import type {JSONContent} from '@tiptap/core'
import fs from 'fs'
import path from 'path'
import {convertTipTapToConfluenceStorage} from '../convertTipTapToConfluenceStorage'
import type {StorageConversionCtx} from '../types'
import {kitchenSink} from './fixtures/kitchenSink'

const ctx: StorageConversionCtx = {
  parabolPageUrl: 'https://dev.parabol.co/pages/kitchen-sink-777',
  appOrigin: 'https://dev.parabol.co',
  resolvePageLink: (pageCode: number) =>
    pageCode === 999
      ? {href: 'https://dev.parabol.co/pages/999', confluenceTitle: 'Child page'}
      : null
}

describe('convertTipTapToConfluenceStorage', () => {
  it('matches the golden storage-format output byte-for-byte', () => {
    const {title, xhtml} = convertTipTapToConfluenceStorage(kitchenSink, ctx)
    const golden = fs.readFileSync(
      path.join(__dirname, 'fixtures/kitchenSink.storage.xhtml'),
      'utf8'
    )
    expect(title).toBe('Kitchen Sink')
    expect(xhtml).toBe(golden.trimEnd())
  })

  it('collects app-origin images/files as assets and leaves external images inline', () => {
    const {assets, xhtml} = convertTipTapToConfluenceStorage(kitchenSink, ctx)
    expect(assets).toContainEqual({
      srcUrl: 'https://dev.parabol.co/assets/Page/123/assets/abc123.png',
      filename: 'abc123.png'
    })
    expect(assets).toContainEqual({
      srcUrl: 'https://dev.parabol.co/assets/Page/123/assets/def456.pdf',
      filename: 'quarterly-report.pdf'
    })
    expect(xhtml).toContain('<ri:url ri:value="https://picsum.photos/200"')
    expect(xhtml).toContain('<ri:attachment ri:filename="abc123.png"')
    expect(xhtml).toContain('ac:align="left"')
    expect(xhtml).toContain('ac:width="320"')
  })

  it('recurses stringified nested docs in taskBlock/responseBlock', () => {
    const {xhtml} = convertTipTapToConfluenceStorage(kitchenSink, ctx)
    expect(xhtml).toContain('Ship the exporter')
    expect(xhtml).toContain('write the golden test')
    expect(xhtml).toContain('Yesterday I fixed the fan-out bug.')
    expect(xhtml).not.toContain('&quot;type&quot;:&quot;doc&quot;')
    expect(xhtml).toContain('<ac:structured-macro ac:name="status">')
    expect(xhtml).toContain('<h3>Marcus</h3>')
  })

  it('renders confluence-native task lists with nested items', () => {
    const {xhtml} = convertTipTapToConfluenceStorage(kitchenSink, ctx)
    expect(xhtml).toContain('<ac:task-list>')
    expect(xhtml).toContain('<ac:task-status>complete</ac:task-status>')
    expect(xhtml).toContain('<ac:task-status>incomplete</ac:task-status>')
    expect(xhtml).toContain('nested todo')
  })

  it('links exported children as ri:page and everything else back to Parabol', () => {
    const {xhtml} = convertTipTapToConfluenceStorage(kitchenSink, ctx)
    expect(xhtml).toContain('<ri:page ri:content-title="Child page"')
    expect(xhtml).toContain('<a href="https://dev.parabol.co/pages/998">A referenced page</a>')
  })

  it('degrades mentions to plain text and counts the census', () => {
    const {xhtml, degraded} = convertTipTapToConfluenceStorage(kitchenSink, ctx)
    expect(xhtml).toContain('@Dana')
    expect(xhtml).toContain('@Marcus')
    expect(xhtml).toContain('#archived')
    expect(degraded).toContainEqual({
      blockType: 'mention',
      count: 2,
      treatment: 'exported as plain text'
    })
    expect(degraded).toContainEqual(expect.objectContaining({blockType: 'taskBlock', count: 1}))
    expect(degraded).toContainEqual(expect.objectContaining({blockType: 'textStyle'}))
    expect(degraded).toContainEqual(expect.objectContaining({blockType: 'fileUpload'}))
  })

  it('appends the Exported-from-Parabol footer with the live-page link', () => {
    const {xhtml} = convertTipTapToConfluenceStorage(kitchenSink, ctx)
    expect(xhtml.endsWith('</p>')).toBe(true)
    expect(xhtml).toContain('Exported from Parabol')
    expect(xhtml).toContain('href="https://dev.parabol.co/pages/kitchen-sink-777"')
  })

  it('escapes XML-hostile text everywhere (title, body, code CDATA)', () => {
    const doc = {
      type: 'doc',
      content: [
        {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'T & <T>'}]},
        {type: 'paragraph', content: [{type: 'text', text: `<script>&"'`}]},
        {type: 'codeBlock', attrs: {language: 'x'}, content: [{type: 'text', text: 'a ]]> b'}]}
      ]
    }
    const {xhtml, title} = convertTipTapToConfluenceStorage(doc, ctx)
    expect(title).toBe('T & <T>')
    expect(xhtml).toContain('&lt;script&gt;&amp;&quot;&#39;')
    expect(xhtml).not.toContain('a ]]> b')
    expect(xhtml).toContain(']]]]><![CDATA[>')
  })

  it('skips thinkingBlock and renders unknown blocks as text with a census entry', () => {
    const doc = {
      type: 'doc',
      content: [
        {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'T'}]},
        {type: 'thinkingBlock'},
        {type: 'mysteryBlock', content: [{type: 'text', text: 'mystery text'}]}
      ]
    }
    const {xhtml, degraded} = convertTipTapToConfluenceStorage(doc, ctx)
    expect(xhtml).not.toContain('thinking')
    expect(xhtml).toContain('mystery text')
    expect(degraded).toContainEqual(expect.objectContaining({blockType: 'unknown:mysteryBlock'}))
  })

  it('exports a table of contents block as the native toc macro', () => {
    const {xhtml, degraded} = convertTipTapToConfluenceStorage(
      {
        type: 'doc',
        content: [
          {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Title'}]},
          {type: 'tableOfContents'},
          {type: 'heading', attrs: {level: 2}, content: [{type: 'text', text: 'Section'}]}
        ]
      },
      ctx
    )
    expect(xhtml).toContain(
      '<ac:structured-macro ac:name="toc"><ac:parameter ac:name="minLevel">1</ac:parameter><ac:parameter ac:name="maxLevel">3</ac:parameter></ac:structured-macro>'
    )
    expect(degraded).toEqual([])
  })

  describe('callouts', () => {
    const p = (text: string): JSONContent => ({type: 'paragraph', content: [{type: 'text', text}]})
    const title = (text: string): JSONContent => ({
      type: 'calloutTitle',
      content: [{type: 'text', text}]
    })
    const callout = (
      tone: string,
      content: JSONContent[],
      attrs: {emoji?: string} = {}
    ): JSONContent => ({type: 'callout', attrs: {tone, emoji: attrs.emoji ?? null}, content})
    const exportOne = (node: JSONContent) =>
      convertTipTapToConfluenceStorage(
        {
          type: 'doc',
          content: [
            {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Callouts'}]},
            node
          ]
        },
        ctx
      ).xhtml.replace(/<p><em>Exported from Parabol.*$/, '')

    it('exports each tone as the storage form Confluence itself saves', () => {
      expect(exportOne(callout('info', [p('x')]))).toBe(
        '<ac:structured-macro ac:name="info"><ac:rich-text-body><p>x</p></ac:rich-text-body></ac:structured-macro>'
      )
      expect(exportOne(callout('tip', [p('x')]))).toContain('ac:name="tip"')
      expect(exportOne(callout('warning', [p('x')]))).toContain('ac:name="note"')
      expect(exportOne(callout('danger', [p('x')]))).toContain('ac:name="warning"')
      expect(exportOne(callout('important', [p('x')]))).toContain(
        '<ac:adf-attribute key="panel-type">note</ac:adf-attribute>'
      )
    })

    it('writes the title as a bold first paragraph inside the panel', () => {
      expect(exportOne(callout('warning', [title('Freeze <now>'), p('x')]))).toContain(
        '<ac:rich-text-body><p><strong>Freeze &lt;now&gt;</strong></p>'
      )
    })

    it('writes a plain callout as a gray custom panel carrying its emoji', () => {
      const xhtml = exportOne(callout('plain', [p('x')], {emoji: '🚀'}))
      expect(xhtml).toContain('<ac:parameter ac:name="bgColor">#B7B9BE</ac:parameter>')
      expect(xhtml).toContain('<ac:parameter ac:name="panelIcon">:rocket:</ac:parameter>')
      expect(xhtml).toContain('<ac:parameter ac:name="panelIconText">🚀</ac:parameter>')
      expect(xhtml).toContain('<ac:parameter ac:name="panelIconId">1f680</ac:parameter>')
    })

    it('drops the emoji of a non-plain callout', () => {
      expect(exportOne(callout('info', [p('x')], {emoji: '🚀'}))).not.toContain('🚀')
    })
  })
})
