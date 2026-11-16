import '../../__tests__/installHappyDom'
import {Editor} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {serverTipTapExtensions} from '../../../../shared/tiptap/serverTipTapExtensions'
import {getPageSlashCommands} from '../getPageSlashCommands'
import {type SlashCommandGroup, slashCommands} from '../slashCommands'

const allCommands = (slashCommands as unknown as readonly SlashCommandGroup[]).flatMap(
  (group) => group.commands
)

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))

test('offers Synced block only outside a synced block', () => {
  expect(getPageSlashCommands({hasDatabases: false, nested: false})['Synced block']).toBe(true)
  expect(getPageSlashCommands({hasDatabases: false, nested: true})['Synced block']).toBe(false)
})

test('Synced block inserts a canonical synced sentinel link', () => {
  const editor = new Editor({
    element: document.createElement('div'),
    extensions: [
      Document.extend({content: 'heading block*'}),
      ...serverTipTapExtensions.map((extension) =>
        extension.name === 'starterKit' ? extension.configure({document: false}) : extension
      )
    ],
    content: {
      type: 'doc',
      content: [
        {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Title'}]},
        {type: 'paragraph'}
      ]
    }
  })
  editor.commands.focus('end')
  const command = allCommands.find((item) => item.title === 'Synced block')
  expect(command).toBeDefined()
  command!.action(editor)
  let attrs: Record<string, unknown> | undefined
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'pageLinkBlock') attrs = node.attrs
  })
  expect(attrs).toMatchObject({pageCode: -1, canonical: true, synced: true})
  editor.destroy()
})
