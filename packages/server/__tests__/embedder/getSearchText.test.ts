import {getSearchText} from '../../../embedder/getSearchText'
import {
  heading,
  paragraph,
  responseBlock,
  table,
  tableView,
  taskBlock
} from '../../__evals__/pagesSearch/heavyCorpus/tiptapNodes'

const avatar = 'https://app.example.com/assets/User/local|lukas/picture/avatar.png'

it('writes a response as its author and text', () => {
  const text = getSearchText(
    responseBlock({
      id: '3a0bd260-c155-d10d-f844-c7eefdd9570b',
      preferredName: 'Lukas Becker',
      avatar,
      content: {
        type: 'doc',
        content: [heading(3, 'What are you working on?'), paragraph('The Postgres 18 upgrade.')]
      }
    })
  )
  expect(text).toBe('Lukas Becker: What are you working on?\nThe Postgres 18 upgrade.')
  expect(text).not.toMatch(/[{}]|"type"|avatar|https?:|3a0bd260/)
})

it('writes a task as its text', () =>
  expect(
    getSearchText(
      taskBlock({id: '81aeafd0', preferredName: 'Arjun Mehta', avatar, text: 'Ship the fix'})
    )
  ).toBe('Task: Ship the fix'))

it('writes a table one row per line', () =>
  expect(getSearchText(table(['Name', 'Votes'], [['CDN purge', '7']]))).toBe(
    'Name | Votes\nCDN purge | 7'
  ))

it('writes a table inside details compactly', () =>
  expect(getSearchText(tableView(['Name', 'Votes'], [['CDN purge', '7']]))).toBe(
    'Table View\nName | Votes\nCDN purge | 7'
  ))

it('drops embed URLs', () =>
  expect(
    getSearchText({
      type: 'embedBlock',
      attrs: {url: 'https://docs.example.com/roadmap', title: 'Roadmap'}
    })
  ).toBe('Roadmap'))

it('writes nothing for a table of contents', () =>
  expect(getSearchText({type: 'tableOfContents'})).toBe(''))

it('skips a block whose stored content is not JSON', () =>
  expect(
    getSearchText({
      type: 'responseBlock',
      attrs: {id: 'broken', preferredName: 'Lukas Becker', avatar, content: '{'}
    })
  ).toBe(''))

const cell = (content: object[]) => ({
  type: 'tableCell',
  attrs: {colspan: 1, rowspan: 1},
  content: [{type: 'paragraph', content}]
})

it('keeps mentions and line breaks inside table cells', () =>
  expect(
    getSearchText({
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [cell([{type: 'text', text: 'Owner'}]), cell([{type: 'text', text: 'Note'}])]
        },
        {
          type: 'tableRow',
          content: [
            cell([
              {type: 'mention', attrs: {id: 'u1', label: 'Lukas Becker'}},
              {type: 'text', text: ' owns'}
            ]),
            cell([
              {type: 'text', text: 'first line'},
              {type: 'hardBreak'},
              {type: 'text', text: 'second line'}
            ])
          ]
        }
      ]
    })
  ).toBe('Owner | Note\nLukas Becker owns | first line second line'))

it('writes an image as its alt text', () =>
  expect(
    getSearchText({
      type: 'imageBlock',
      attrs: {src: 'https://app.example.com/assets/n4bQgYhM.webp', alt: 'Release plan'}
    })
  ).toBe('Release plan'))

it('writes a table inside a response like any other table', () =>
  expect(
    getSearchText(
      responseBlock({
        id: 'r1',
        preferredName: 'Lukas Becker',
        avatar,
        content: {type: 'doc', content: [table(['Step', 'Owner'], [['Deploy', 'Lukas']])]}
      })
    )
  ).toBe('Lukas Becker: Step | Owner\nDeploy | Lukas'))
