import {Link, Title} from '@mui/icons-material'
import linkify from 'parabol-client/utils/linkify'
import {useCallback, useMemo, useState} from 'react'

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
    <form onSubmit={handleSubmit} className='flex flex-col items-center pt-2 text-slate-600'>
      <div className='form-group flex items-center'>
        <Link
          style={{
            width: 18,
            height: 18
          }}
          className='mr-2 flex-none'
        />
        <input
          autoFocus
          type='url'
          className='min-w-52 flex-1 border-none bg-transparent'
          placeholder='Enter URL'
          value={url}
          onChange={onChangeURL}
        />
      </div>
      <div className='form-group flex items-center'>
        <Title
          style={{
            width: 18,
            height: 18
          }}
          className='mr-2 flex-none'
        />
        <input
          className='min-w-52 flex-1 border-none bg-transparent'
          placeholder='Link Title'
          value={text}
          onChange={onChangeText}
        />
      </div>
      <div className='flex w-full items-end justify-end'>
        <button type='submit' disabled={!isValidUrl} className='btn btn-tertiary'>
          Save
        </button>
      </div>
    </form>
  )
}
