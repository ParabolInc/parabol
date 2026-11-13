import {Editor} from '@tiptap/core'
import {convertADFToTipTap} from '../convertADFToTipTap'
import {convertTiptapToADF} from '../convertTipTapToADF'
import {serverTipTapExtensions} from '../serverTipTapExtensions'
import type {TipTapSerializedContent} from '../TipTapSerializedContent'

describe('convertTiptapToADF', () => {
  it('converts every block, including the first', () => {
    const adf = convertTiptapToADF({
      type: 'doc',
      content: [
        {type: 'paragraph', content: [{type: 'text', text: 'It wobbles'}]},
        {type: 'paragraph', content: [{type: 'text', text: 'Mostly on mobile'}]}
      ]
    })
    expect(adf).toEqual({
      type: 'doc',
      version: 1,
      content: [
        {type: 'paragraph', content: [{type: 'text', text: 'It wobbles'}]},
        {type: 'paragraph', content: [{type: 'text', text: 'Mostly on mobile'}]}
      ]
    })
  })

  it.each(['sub', 'sup'])('round-trips a %s subsup mark', (scriptType) => {
    const scriptText = {
      type: 'text',
      text: '2',
      marks: [{type: 'subsup', attrs: {type: scriptType}}]
    }
    const adf = {type: 'doc', version: 1, content: [{type: 'paragraph', content: [scriptText]}]}
    expect(convertTiptapToADF(convertADFToTipTap(adf, 'Title')).content?.[1]).toEqual({
      type: 'paragraph',
      content: [scriptText]
    })
  })

  it('exports one subsup mark when superscript is applied over subscript', () => {
    const editor = new Editor({
      element: undefined,
      extensions: serverTipTapExtensions,
      content: {
        type: 'doc',
        content: [
          {type: 'paragraph', content: [{type: 'text', text: 'x2', marks: [{type: 'subscript'}]}]}
        ]
      }
    })
    editor.chain().selectAll().setSuperscript().run()
    const adf = convertTiptapToADF(editor.getJSON() as TipTapSerializedContent)
    editor.destroy()
    expect(adf.content?.[0]).toEqual({
      type: 'paragraph',
      content: [{type: 'text', text: 'x2', marks: [{type: 'subsup', attrs: {type: 'sup'}}]}]
    })
  })

  it('falls back to an empty paragraph because ADF needs one block', () => {
    expect(convertTiptapToADF({type: 'doc', content: []})).toEqual({
      type: 'doc',
      version: 1,
      content: [{type: 'paragraph'}]
    })
  })
})
