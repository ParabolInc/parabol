import {splitTipTapContent} from '../splitTipTapContent'

const taskTag = (id: string) => ({
  type: 'taskTag',
  attrs: {id, label: null, mentionSuggestionChar: '#'}
})

describe('splitTipTapContent', () => {
  it('splits the first block into the title and the rest into the body', () => {
    const {title, bodyContent} = splitTipTapContent({
      type: 'doc',
      content: [
        {type: 'paragraph', content: [{type: 'text', text: 'Fix the widget'}]},
        {type: 'paragraph', content: [{type: 'text', text: 'It wobbles'}]}
      ]
    })
    expect(title).toBe('Fix the widget')
    expect(bodyContent.content).toEqual([
      {type: 'paragraph', content: [{type: 'text', text: 'It wobbles'}]}
    ])
  })

  it('leaves task tag chips out of both the title and the body', () => {
    const {title, bodyContent} = splitTipTapContent({
      type: 'doc',
      content: [
        {type: 'paragraph', content: [{type: 'text', text: 'Fix the widget '}, taskTag('private')]},
        {type: 'paragraph', content: [taskTag('archived'), {type: 'text', text: ' It wobbles'}]}
      ]
    })
    expect(title).toBe('Fix the widget')
    expect(JSON.stringify(bodyContent)).not.toContain('taskTag')
    expect(JSON.stringify(bodyContent)).toContain('It wobbles')
  })
})
