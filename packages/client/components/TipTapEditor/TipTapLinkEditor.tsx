import {useMemo, useState} from 'react'
import {Button} from '../../ui/Button/Button'
import {Input} from '../../ui/Input/Input'
import linkify from '../../utils/linkify'

export type props = {
  initialUrl: string
  initialText: string
  onSetLink: (link: {text: string; url: string}) => void
  onUnsetLink: () => void
  useLinkEditor?: () => void
}

const getHref = (input: string) => {
  const trimmedInput = input.trim()
  const matches = linkify.match(trimmedInput)
  if (matches?.length !== 1) return null
  const [match] = matches
  if (!match || match.index !== 0 || match.lastIndex !== trimmedInput.length) return null
  return match.schema ? match.url : `https://${match.raw}`
}

export const TipTapLinkEditor = (props: props) => {
  const {useLinkEditor, onSetLink, onUnsetLink, initialUrl, initialText} = props
  const [url, setUrl] = useState(initialUrl)
  const [text, setText] = useState(initialText)
  const href = useMemo(() => getHref(url), [url])
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!href) return
    onSetLink({text: text || url.trim(), url: href})
  }
  useLinkEditor?.()
  return (
    <form
      onSubmit={handleSubmit}
      className='flex w-72 flex-col gap-3 rounded-md border border-hairline bg-surface-modal p-3 font-semibold text-fg-secondary text-xs shadow-[var(--shadow-card-raised)]'
    >
      <label className='flex flex-col gap-1'>
        Text
        <Input
          className='h-8 font-normal text-base text-fg-primary sm:text-sm'
          maxLength={255}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <label className='flex flex-col gap-1'>
        Link
        <Input
          autoFocus
          inputMode='url'
          autoCapitalize='off'
          autoCorrect='off'
          spellCheck={false}
          className='h-8 font-normal text-base text-fg-primary sm:text-sm'
          maxLength={2048}
          placeholder='Paste or type a link'
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>
      <div className='flex items-center justify-between'>
        {initialUrl ? (
          <Button
            type='button'
            variant='flat'
            size='sm'
            className='-ml-2 px-2'
            onClick={onUnsetLink}
          >
            Remove link
          </Button>
        ) : (
          <span />
        )}
        <Button type='submit' variant='dialogPrimary' size='sm' disabled={!href}>
          Apply
        </Button>
      </div>
    </form>
  )
}
