import type {Editor} from '@tiptap/core'
import {useRef} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {useEmbedUserAsset} from '../../../mutations/useEmbedUserAsset'
import type {FileUploadTargetType} from '../../../shared/tiptap/extensions/FileUploadBase'
import {Button} from '../../../ui/Button/Button'

interface Props {
  editor: Editor
  targetType: FileUploadTargetType
}

export const FileSelectorEmbedTab = (props: Props) => {
  const {editor, targetType} = props
  const ref = useRef<HTMLInputElement>(null)
  const atmosphere = useAtmosphere()
  const [commit] = useEmbedUserAsset()
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const url = ref.current?.value
    if (!url) return
    const {scopeKey, assetScope} = editor.extensionStorage.fileUpload
    commit({
      variables: {url, scope: assetScope, scopeKey},
      onCompleted: (res) => {
        const {embedUserAsset} = res
        const {url} = embedUserAsset!
        const message = embedUserAsset?.error?.message
        if (message) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'errorEmbeddingAsset',
            message,
            autoDismiss: 5
          })
          return
        }
        const blockType = targetType === 'image' ? 'imageBlock' : 'fileBlock'
        editor
          .chain()
          .focus()
          .insertContent({
            type: blockType,
            attrs: {src: url}
          })
          .run()
      }
    })
  }
  return (
    <form
      className='flex w-full min-w-44 flex-col items-center justify-center space-y-3 rounded-md bg-slate-100 p-2'
      onSubmit={onSubmit}
    >
      <input
        autoComplete='off'
        autoFocus
        placeholder={`Paste the ${targetType} link…`}
        type='url'
        className='w-full outline-hidden focus:ring-2'
        ref={ref}
      />
      <Button variant='outline' shape='pill' className='w-full' type='submit'>
        Embed {targetType}
      </Button>
    </form>
  )
}
