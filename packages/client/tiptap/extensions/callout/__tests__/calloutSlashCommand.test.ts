import '../../__tests__/installHappyDom'
import {Editor} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {CalloutBase} from '../../../../shared/tiptap/extensions/CalloutBase'
import {serverTipTapExtensions} from '../../../../shared/tiptap/serverTipTapExtensions'
import {slashCommands} from '../../slashCommand/slashCommands'
import {Callout} from '../Callout'
import {calloutForQuery} from '../calloutSlashCommand'
import {CALLOUT_TONE_STYLES} from '../calloutToneStyles'

const pagesExtensions = [
  Document.extend({content: 'heading block*'}),
  ...serverTipTapExtensions.map((extension) => {
    if (extension.name === 'starterKit') {
      return extension.configure({document: false, trailingNode: {node: 'paragraph'}})
    }
    return extension === CalloutBase ? Callout : extension
  })
]

const mount = () => {
  const editor = new Editor({
    element: document.createElement('div'),
    extensions: pagesExtensions,
    content: {
      type: 'doc',
      content: [
        {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Title'}]},
        {type: 'paragraph', content: [{type: 'text', text: 'hello'}]}
      ]
    }
  })
  editor.commands.setTextSelection(editor.state.doc.content.size - 2)
  return editor
}

const calloutTone = (editor: Editor) => {
  let tone: unknown = null
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'callout') tone = node.attrs.tone
  })
  return tone
}

test('a tone query renames the row and inserts that tone', () => {
  const editor = mount()
  const row = calloutForQuery('warn')
  expect(row?.title).toBe('Warning callout')
  expect(row?.icon).toBe(CALLOUT_TONE_STYLES.warning.Icon)
  row?.action(editor)
  expect(calloutTone(editor)).toBe('warning')
})

test('a generic query keeps the plain Callout row', () => {
  expect(calloutForQuery('call')).toBeNull()
  expect(calloutForQuery('in')).toBeNull()
  expect(calloutForQuery('pla')).toBeNull()
})

test('a padded, upper-case query still matches', () => {
  expect(calloutForQuery(' TIP ')?.title).toBe('Tip callout')
})

test('the Callout row is hidden in an editor without callouts', () => {
  const calloutCommand = slashCommands
    .flatMap(
      (group): readonly {title: string; shouldHide?: (editor: Editor) => boolean}[] =>
        group.commands
    )
    .find((command) => command.title === 'Callout')
  const editorWithoutCallout = new Editor({
    element: document.createElement('div'),
    extensions: serverTipTapExtensions.filter((extension) => extension !== CalloutBase)
  })
  expect(calloutCommand?.shouldHide?.(editorWithoutCallout)).toBe(true)
  expect(calloutCommand?.shouldHide?.(mount())).toBe(false)
})
