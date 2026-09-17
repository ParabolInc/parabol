import {unfurlLoomLinks} from '../LoomExtension'

const loomParagraph = {
  type: 'paragraph',
  content: [
    {
      type: 'text',
      text: 'a demo',
      marks: [{type: 'link', attrs: {href: 'https://www.loom.com/share/abc123'}}]
    }
  ]
}

test('appends a loom node after a paragraph linking to loom', () => {
  const res = unfurlLoomLinks({type: 'doc', content: [loomParagraph]})
  expect(res.content).toEqual([
    loomParagraph,
    {type: 'loom', attrs: {src: 'https://www.loom.com/share/abc123'}}
  ])
})

test('keeps the attributes of every block it walks through', () => {
  const doc = {
    type: 'doc',
    content: [
      {type: 'heading', attrs: {level: 3}, content: [{type: 'text', text: 'Heading three'}]},
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: {checked: true},
            content: [{type: 'paragraph', content: [{type: 'text', text: 'done'}]}]
          }
        ]
      },
      {type: 'orderedList', attrs: {start: 3}, content: []},
      {type: 'details', attrs: {open: false}, content: []},
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                attrs: {colspan: 2, rowspan: 1, align: 'right'},
                content: [{type: 'paragraph'}]
              }
            ]
          }
        ]
      }
    ]
  }
  expect(unfurlLoomLinks(doc)).toEqual(doc)
})
