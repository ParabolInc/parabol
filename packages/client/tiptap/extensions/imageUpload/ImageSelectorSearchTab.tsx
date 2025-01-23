import {useRef} from 'react'
import {Button} from '../../../ui/Button/Button'

interface Props {
  setImageURL: (url: string) => void
}

export const ImageSelectorSearchTab = (props: Props) => {
  const {setImageURL} = props
  const ref = useRef<HTMLInputElement>(null)
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const url = ref.current?.value
    if (!url) return
    setImageURL(url!)
  }
  const service = window.__ACTION__.GIF_PROVIDER
  // Per attribution spec, the exact wording is required
  // https://developers.google.com/tenor/guides/attribution
  const placeholder = service === 'tenor' ? 'Search Tenor' : 'Search Gifs'

  return (
    <form
      className='flex w-full min-w-44 flex-col items-center justify-center space-y-3 rounded-md bg-slate-100 p-2'
      onSubmit={onSubmit}
    >
      <input
        autoComplete='off'
        autoFocus
        placeholder={placeholder}
        type='url'
        className='w-full outline-none focus:ring-2'
        ref={ref}
      />
      <Button variant='outline' shape='pill' className='w-full' type='submit'>
        Search image
      </Button>
    </form>
  )
}
