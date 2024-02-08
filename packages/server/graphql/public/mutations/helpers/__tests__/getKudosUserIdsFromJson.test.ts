import {getKudosUserIdsFromJson} from '../getKudosUserIdsFromJson'
import {JSONContent} from '@tiptap/core'

describe('findMentionsByEmoji', () => {
  let doc: JSONContent

  beforeAll(() => {
    doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Paragraph1'
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Paragraph2'
            }
          ]
        },
        {
          type: 'paragraph'
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Paragraph from new line'
            }
          ]
        },
        {
          type: 'paragraph'
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Paragraph from new line'
            },
            {
              type: 'hardBreak'
            },
            {
              type: 'text',
              text: 'and break in the same paragraph'
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Just new line with mention '
            },
            {
              type: 'mention',
              attrs: {
                id: 'user_id_1',
                label: 'userone'
              }
            },
            {
              type: 'text',
              text: ' ❤️'
            }
          ]
        },
        {
          type: 'paragraph'
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '❤️ Another mentions '
            },
            {
              type: 'mention',
              attrs: {
                id: 'user_id_2',
                label: 'usertwo'
              }
            },
            {
              type: 'hardBreak'
            },
            {
              type: 'mention',
              attrs: {
                id: 'user_id_3',
                label: 'userthree'
              }
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'mention',
              attrs: {
                id: 'user_id_supermention',
                label: 'supermention'
              }
            },
            {
              type: 'text',
              text: ' 🌮'
            }
          ]
        },
        {
          type: 'paragraph'
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'mention',
              attrs: {
                id: 'user_id_4',
                label: 'userone'
              }
            },
            {
              type: 'text',
              text: ' '
            },
            {
              type: 'mention',
              attrs: {
                id: 'user_id_5',
                label: 'userfour'
              }
            },
            {
              type: 'text',
              text: ' both mentioned ❤️'
            }
          ]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'List item with mention '
                    },
                    {
                      type: 'mention',
                      attrs: {
                        id: 'user_id_list_1',
                        label: 'userlistone'
                      }
                    },
                    {
                      type: 'text',
                      text: ' ❤️ in a list'
                    }
                  ]
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'bulletList',
                      content: [
                        {
                          type: 'listItem',
                          content: [
                            {
                              type: 'paragraph',
                              content: [
                                {
                                  type: 'mention',
                                  attrs: {
                                    id: 'user_id_nested_list',
                                    label: 'usernestedlist'
                                  }
                                },
                                {
                                  type: 'text',
                                  text: ' Nested mention ❤️'
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  })

  it('returns correct mention user IDs for emoji ❤️', () => {
    const emoji = '❤️'
    const result = getKudosUserIdsFromJson(doc, emoji)
    expect(result).toEqual(['user_id_1', 'user_id_2', 'user_id_3', 'user_id_4', 'user_id_5'])
  })

  it('returns correct mention user IDs for different emoji (🌮)', () => {
    const emoji = '🌮'
    const result = getKudosUserIdsFromJson(doc, emoji)
    expect(result).toEqual(['user_id_supermention'])
  })

  it('returns an empty array for an emoji with no mentions (🔥)', () => {
    const emoji = '🔥'
    const result = getKudosUserIdsFromJson(doc, emoji)
    expect(result).toEqual([])
  })

  it('does not include duplicate IDs', () => {
    const emoji = '❤️'
    const result = getKudosUserIdsFromJson(doc, emoji)
    const uniqueResult = Array.from(new Set(result))
    expect(result).toEqual(uniqueResult)
  })

  it('handles nested list mentions correctly for emoji ❤️', () => {
    const emoji = '❤️'
    const result = getKudosUserIdsFromJson(doc, emoji)
    expect(result).toContain('user_id_list_1')
    expect(result).toContain('user_id_nested_list')
  })
})
