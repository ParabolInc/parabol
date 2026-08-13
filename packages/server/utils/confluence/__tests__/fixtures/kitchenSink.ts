import type {JSONContent} from '@tiptap/core'

const taskBlockNestedDoc: JSONContent = {
  type: 'doc',
  content: [
    {type: 'paragraph', content: [{type: 'text', text: 'Ship the exporter'}]},
    {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: {checked: false},
          content: [{type: 'paragraph', content: [{type: 'text', text: 'write the golden test'}]}]
        }
      ]
    }
  ]
}

const responseBlockNestedDoc: JSONContent = {
  type: 'doc',
  content: [
    {type: 'paragraph', content: [{type: 'text', text: 'Yesterday I fixed the fan-out bug.'}]}
  ]
}

export const kitchenSink: JSONContent = {
  type: 'doc',
  content: [
    {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Kitchen Sink'}]},
    {type: 'heading', attrs: {level: 2}, content: [{type: 'text', text: 'Marks'}]},
    {
      type: 'paragraph',
      content: [
        {type: 'text', text: 'bold', marks: [{type: 'bold'}]},
        {type: 'text', text: ' italic', marks: [{type: 'italic'}]},
        {type: 'text', text: ' underline', marks: [{type: 'underline'}]},
        {type: 'text', text: ' strike', marks: [{type: 'strike'}]},
        {type: 'text', text: ' code', marks: [{type: 'code'}]},
        {
          type: 'text',
          text: ' a link',
          marks: [{type: 'link', attrs: {href: 'https://example.com/a?b=1&c=2'}}]
        },
        {
          type: 'text',
          text: ' colored',
          marks: [{type: 'textStyle', attrs: {color: '#ff0000'}}]
        },
        {
          type: 'text',
          text: ' highlighted',
          marks: [{type: 'highlight', attrs: {color: '#ffff00'}}]
        },
        {type: 'hardBreak'},
        {type: 'text', text: 'after a hard break with emoji 🎉'}
      ]
    },
    {type: 'horizontalRule'},
    {type: 'heading', attrs: {level: 3}, content: [{type: 'text', text: 'Lists'}]},
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {type: 'paragraph', content: [{type: 'text', text: 'bullet one'}]},
            {
              type: 'orderedList',
              content: [
                {
                  type: 'listItem',
                  content: [{type: 'paragraph', content: [{type: 'text', text: 'nested number'}]}]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: {checked: true},
          content: [{type: 'paragraph', content: [{type: 'text', text: 'done item'}]}]
        },
        {
          type: 'taskItem',
          attrs: {checked: false},
          content: [
            {type: 'paragraph', content: [{type: 'text', text: 'open item'}]},
            {
              type: 'taskList',
              content: [
                {
                  type: 'taskItem',
                  attrs: {checked: false},
                  content: [{type: 'paragraph', content: [{type: 'text', text: 'nested todo'}]}]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'blockquote',
      content: [{type: 'paragraph', content: [{type: 'text', text: 'a wise quote'}]}]
    },
    {
      type: 'codeBlock',
      attrs: {language: 'typescript'},
      content: [{type: 'text', text: 'const x: number = 1'}]
    },
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableHeader',
              attrs: {colspan: 1, rowspan: 1},
              content: [{type: 'paragraph', content: [{type: 'text', text: 'Header A'}]}]
            },
            {
              type: 'tableHeader',
              attrs: {colspan: 1, rowspan: 1},
              content: [{type: 'paragraph', content: [{type: 'text', text: 'Header B'}]}]
            }
          ]
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: {colspan: 2, rowspan: 1},
              content: [{type: 'paragraph', content: [{type: 'text', text: 'spans both'}]}]
            }
          ]
        }
      ]
    },
    {
      type: 'details',
      content: [
        {type: 'detailsSummary', content: [{type: 'text', text: 'Toggle title'}]},
        {
          type: 'detailsContent',
          content: [{type: 'paragraph', content: [{type: 'text', text: 'hidden content'}]}]
        }
      ]
    },
    {
      type: 'imageBlock',
      attrs: {
        src: 'https://dev.parabol.co/assets/Page/123/assets/abc123.png',
        alt: 'a red square',
        width: 320,
        align: 'left'
      }
    },
    {
      type: 'imageBlock',
      attrs: {src: 'https://picsum.photos/200', alt: 'external'}
    },
    {
      type: 'fileBlock',
      attrs: {
        src: 'https://dev.parabol.co/assets/Page/123/assets/def456.pdf',
        name: 'quarterly-report.pdf',
        fileType: 'application/pdf',
        size: 12345
      }
    },
    {type: 'loom', attrs: {src: 'https://www.loom.com/share/abc123def456'}},
    {type: 'pageLinkBlock', attrs: {pageCode: 999, title: 'Child page', canonical: true}},
    {type: 'pageLinkBlock', attrs: {pageCode: 998, title: 'A referenced page', canonical: false}},
    {
      type: 'paragraph',
      content: [
        {type: 'text', text: 'Ping '},
        {type: 'pageUserMention', attrs: {id: 'user123', label: 'Dana'}},
        {type: 'text', text: ' and '},
        {type: 'mention', attrs: {id: 'user456', label: 'Marcus'}},
        {type: 'text', text: ' about '},
        {type: 'taskTag', attrs: {id: 'archived'}},
        {type: 'text', text: ' — '},
        {type: 'popoverMention', attrs: {label: 'Q3 Bets', content: '{"type":"doc","content":[]}'}}
      ]
    },
    {
      type: 'insightsBlock',
      attrs: {id: 'insights1', title: 'Latest Team Insights'},
      content: [
        {type: 'paragraph', content: [{type: 'text', text: 'The team is trending up.'}]},
        {
          type: 'taskBlock',
          attrs: {
            id: 'task1',
            status: 'active',
            preferredName: 'Priya',
            service: null,
            content: JSON.stringify(taskBlockNestedDoc)
          }
        }
      ]
    },
    {
      type: 'responseBlock',
      attrs: {
        id: 'resp1',
        preferredName: 'Marcus',
        content: JSON.stringify(responseBlockNestedDoc)
      }
    },
    {type: 'fileUpload', attrs: {targetType: 'image'}}
  ]
}
