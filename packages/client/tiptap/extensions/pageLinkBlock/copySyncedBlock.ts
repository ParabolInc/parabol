import type {Editor} from '@tiptap/core'
import type Atmosphere from '../../../Atmosphere'
import type {PageLinkBlockAttrs} from '../../../shared/tiptap/extensions/PageLinkBlockBase'
import {serializeSyncedBlock} from './serializeSyncedBlock'

const writeToClipboard = ({html, text}: {html: string; text: string}) => {
  const {clipboard} = navigator
  if (typeof ClipboardItem === 'undefined' || !clipboard.write) return clipboard.writeText(text)
  return clipboard.write([
    new ClipboardItem({
      'text/html': new Blob([html], {type: 'text/html'}),
      'text/plain': new Blob([text], {type: 'text/plain'})
    })
  ])
}

export const copySyncedBlock = async (
  attrs: Pick<PageLinkBlockAttrs, 'pageCode' | 'title'>,
  content: Editor | null,
  atmosphere: Pick<Atmosphere, 'eventEmitter'>
) => {
  try {
    await writeToClipboard(serializeSyncedBlock(attrs, content))
  } catch {
    return
  }
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: 'SyncedBlockCopied',
    message: 'Copied. Paste on any page to sync it.',
    autoDismiss: 5
  })
}
