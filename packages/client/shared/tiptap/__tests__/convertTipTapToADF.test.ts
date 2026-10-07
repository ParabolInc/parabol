import {convertTiptapToADF} from '../convertTipTapToADF'

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

  it('falls back to an empty paragraph because ADF needs one block', () => {
    expect(convertTiptapToADF({type: 'doc', content: []})).toEqual({
      type: 'doc',
      version: 1,
      content: [{type: 'paragraph'}]
    })
  })
})
