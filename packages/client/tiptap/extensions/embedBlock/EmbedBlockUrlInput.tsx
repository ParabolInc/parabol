import {useId, useState} from 'react'
import {Link as LinkIcon} from '~/ui/icons'
import {normalizeEmbedUrl} from '../../../shared/embed/normalizeEmbedUrl'
import {Button} from '../../../ui/Button/Button'

interface Props {
  isResolving: boolean
  onSubmit: (url: string) => void
  onCancel: () => void
}

const isSchemePrefix = (text: string) => 'https://'.startsWith(text) || 'http://'.startsWith(text)

export const EmbedBlockUrlInput = (props: Props) => {
  const {isResolving, onSubmit, onCancel} = props
  const [value, setValue] = useState('')
  const hintId = useId()
  const normalizedUrl = normalizeEmbedUrl(value)
  const trimmed = value.trim()
  const isInvalid = !!trimmed && !normalizedUrl && !isSchemePrefix(trimmed.toLowerCase())

  const submit = () => {
    if (normalizedUrl) onSubmit(normalizedUrl)
  }

  return (
    <div className='rounded-md border border-hairline border-dashed bg-surface-well p-3'>
      <div className='flex items-center gap-2'>
        <LinkIcon className='size-5 shrink-0 text-fg-muted' />
        <input
          autoFocus
          type='url'
          value={value}
          placeholder='Paste a link to embed'
          aria-invalid={isInvalid || undefined}
          aria-describedby={isInvalid ? hintId : undefined}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return
            if (e.key === 'Enter') {
              e.preventDefault()
              e.stopPropagation()
              submit()
            } else if (e.key === 'Escape' || (e.key === 'Backspace' && !value && !e.repeat)) {
              e.preventDefault()
              e.stopPropagation()
              onCancel()
            }
          }}
          className='min-w-0 flex-1 rounded-sm border border-hairline-field bg-surface-input px-2 py-1 text-sm outline-hidden focus:border-accent'
        />
        <Button
          variant='secondary'
          size='sm'
          disabled={!normalizedUrl || isResolving}
          onClick={submit}
        >
          {isResolving ? 'Loading…' : 'Embed'}
        </Button>
      </div>
      {isInvalid && (
        <p id={hintId} role='alert' className='m-0 mt-2 pl-7 text-fg-secondary text-xs'>
          Paste a full link, starting with https://
        </p>
      )}
    </div>
  )
}
