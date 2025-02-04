import {useRef} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {useEmbedUserAsset} from '../../../mutations/useEmbedUserAsset'
import {Button} from '../../../ui/Button/Button'

interface Props {
  setImageURL: (url: string) => void
}

export const ImageSelectorEmbedTab = (props: Props) => {
  const {setImageURL} = props
  const ref = useRef<HTMLInputElement>(null)
  const atmosphere = useAtmosphere()
  const [commit] = useEmbedUserAsset()
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const url = ref.current?.value
    if (!url) return
    commit({
      variables: {url},
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
        setImageURL(url!)
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
        placeholder='Paste the image link…'
        type='url'
        className='w-full outline-hidden focus:ring-2'
        ref={ref}
      />
      <Button variant='outline' shape='pill' className='w-full' type='submit'>
        Embed image
      </Button>
    </form>
  )
}
