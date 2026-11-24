import {getSchema} from '@tiptap/core'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import appOrigin from '../../appOrigin'
import markdownToTaskContent from '../markdownToTaskContent'

const schema = getSchema(serverTipTapExtensions)

describe('markdownToTaskContent', () => {
  test('keeps a Parabol image that starts an ordered list item, in a valid doc', () => {
    const src = `${appOrigin}/assets/a.png`
    const doc = JSON.parse(markdownToTaskContent(`1. ![x](${src})`))
    expect(() => schema.nodeFromJSON(doc).check()).not.toThrow()
    const [listItem] = doc.content[0].content
    expect(listItem.content.map(({type}: {type: string}) => type)).toEqual([
      'paragraph',
      'imageBlock'
    ])
    expect(listItem.content[1].attrs.src).toBe(src)
  })
})
