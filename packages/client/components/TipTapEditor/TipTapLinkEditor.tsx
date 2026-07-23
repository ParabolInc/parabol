import {Link, Title} from '@mui/icons-material'
import {useCallback, useMemo, useState} from 'react'
import {Button} from '../../ui/Button/Button'
import linkify from '../../utils/linkify'

export type props = {
  initialUrl: string
  initialText: string
  onSetLink: (link: {text: string; url: string}) => void
  useLinkEditor?: () => void
}

export const TipTapLinkEditor = (props: props) => {
  const {useLinkEditor, onSetLink, initialUrl, initialText} = props

  const [url, setUrl] = useState(initialUrl)
  const [text, setText] = useState(initialText)
  const onChangeURL = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value)
  }, [])
  const onChangeText = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value)
  }, [])
  const isValidUrl = useMemo(() => (!url ? false : linkify.match(url)), [url])
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!isValidUrl) return
      onSetLink({text, url})
    },
    [url, text, isValidUrl, onSetLink]
  )
  useLinkEditor?.()
  return (
    <div
      className={
        'flex items-center rounded-md border border-hairline bg-surface-card p-2 shadow-lg'
      }
    >
      <form onSubmit={handleSubmit} className='flex flex-col items-center'>
        <label className='flex cursor-text items-center gap-2 rounded-lg bg-surface-well p-2'>
          <Link className='flex-none text-fg-secondary' />
          <input
            autoFocus
            type='url'
            className='min-w-52 flex-1 bg-transparent text-fg-primary text-sm outline-hidden'
            placeholder='Enter URL'
            value={url}
            onChange={onChangeURL}
          />
        </label>
        <label className='flex cursor-text items-center gap-2 rounded-lg bg-surface-well p-2'>
          <Title className='flex-none text-fg-secondary' />
          <input
            className='min-w-52 flex-1 bg-transparent text-fg-primary text-sm outline-hidden'
            placeholder='Link Title'
            value={text}
            onChange={onChangeText}
          />
        </label>
        <div className='flex w-full items-end justify-end'>
          <Button
            variant='flat'
            size='sm'
            type='submit'
            disabled={!isValidUrl}
            className='font-semibold text-fg-primary'
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}
