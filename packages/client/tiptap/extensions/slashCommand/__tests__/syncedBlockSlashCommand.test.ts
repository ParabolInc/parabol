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

const enabledTitles = (options: {hasSyncedBlocks: boolean; nested: boolean}) => {
  const commands = getPageSlashCommands({hasDatabases: false, ...options})
  return allCommands
    .map((command) => command.title)
    .filter((title) => commands[title as keyof typeof commands])
}

test('offers Synced block only when the flag is on and outside a synced block', () => {
  expect(enabledTitles({hasSyncedBlocks: true, nested: false})).toContain('Synced block')
  expect(enabledTitles({hasSyncedBlocks: false, nested: false})).not.toContain('Synced block')
  expect(enabledTitles({hasSyncedBlocks: true, nested: true})).not.toContain('Synced block')
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
