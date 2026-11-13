import type {Editor} from '@tiptap/core'
import {useRef} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {useEmbedUserAsset} from '../../../mutations/useEmbedUserAsset'
import type {FileUploadTargetType} from '../../../shared/tiptap/extensions/FileUploadBase'
import {Button} from '../../../ui/Button/Button'
import getMutationError from '../../../utils/relay/getMutationError'

interface Props {
  editor: Editor
  targetType: FileUploadTargetType
}

export const FileSelectorEmbedTab = (props: Props) => {
  const {editor, targetType} = props
  const ref = useRef<HTMLInputElement>(null)
  const atmosphere = useAtmosphere()
  const [commit, submitting] = useEmbedUserAsset()
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const url = ref.current?.value
    if (!url) return
    const {scopeKey, assetScope} = editor.extensionStorage.fileUpload
    const showEmbedError = (message: string) => {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'errorEmbeddingAsset',
        message,
        autoDismiss: 5
      })
    }
    commit({
      variables: {url, scope: assetScope, scopeKey},
      onError: (error) => showEmbedError(getMutationError(error).message),
      onCompleted: (res) => {
        const {embedUserAsset} = res
        const message = embedUserAsset?.error?.message
        if (message) {
          showEmbedError(message)
          return
        }
        const {url, name, type, size} = embedUserAsset!
        const src = url!
        const fileName = name!
        const fileType = type!
        const fileSize = size!
        if (targetType === 'image') {
          editor.chain().focus().setImageBlock({src}).run()
        } else {
          editor.chain().focus().setFileBlock({src, name: fileName, fileType, size: fileSize}).run()
        }
      }
    })
  }
  return (
    <form
      className='flex w-full min-w-44 flex-col items-center justify-center space-y-3 rounded-md bg-surface-card p-2'
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
      <Button variant='outline' className='w-full' type='submit' disabled={submitting}>
        Embed {targetType}
      </Button>
    </form>
  )
}
