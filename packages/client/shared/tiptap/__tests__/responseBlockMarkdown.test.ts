import {tipTapToMarkdown} from '../tipTapToMarkdown'

const responseDoc = (content: string) => ({
  type: 'doc',
  content: [
    {
      type: 'responseBlock',
      attrs: {id: 'r1', preferredName: 'Ann_B', avatar: 'https://example.com/a.png', content}
    }
  ]
})

const answer = JSON.stringify({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {type: 'text', text: 'Shipped the '},
        {type: 'text', text: 'widget', marks: [{type: 'bold'}]}
      ]
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [{type: 'paragraph', content: [{type: 'text', text: 'Next: docs'}]}]
        }
      ]
    }
  ]
})

describe('responseBlock markdown', () => {
  it('reads as a quote of the author and their answer', () => {
    expect(tipTapToMarkdown(responseDoc(answer))).toBe(
      '> **Ann\\_B:**\n>\n> Shipped the **widget**\n>\n> - Next: docs'
    )
  })

  it('a response without content reads as its author', () => {
    expect(tipTapToMarkdown(responseDoc(''))).toBe('> **Ann\\_B:**')
  })
})
