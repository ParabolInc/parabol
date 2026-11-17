import {generateHTML} from '@tiptap/html/server'
import StarterKit from '@tiptap/starter-kit'
import {SafeTextStyleKit} from '../extensions/SafeTextStyleKit'

const render = (attrs: Record<string, string>) =>
  generateHTML(
    {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{type: 'text', text: 'hi', marks: [{type: 'textStyle', attrs}]}]
        }
      ]
    },
    [StarterKit, SafeTextStyleKit]
  )

test('renders color, size and font values', () => {
  expect(render({color: '#ff0000'})).toContain('color: #ff0000')
  expect(render({backgroundColor: 'rgb(1, 2, 3)'})).toContain('background-color: rgb(1, 2, 3)')
  expect(render({fontSize: '12px'})).toContain('font-size: 12px')
  expect(render({fontFamily: 'Times New Roman, serif'})).toContain('Times New Roman')
})

test('drops values that would add CSS declarations', () => {
  const html = render({
    color: 'red;position:fixed;inset:0',
    backgroundColor: 'red; background-image: url(https://example.com/x.png)'
  })
  expect(html).not.toContain('position')
  expect(html).not.toContain('url(')
})
