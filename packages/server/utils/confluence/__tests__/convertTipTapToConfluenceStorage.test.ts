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
})
