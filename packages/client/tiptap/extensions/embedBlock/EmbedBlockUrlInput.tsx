import {useState} from 'react'
import {Link as LinkIcon} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'

interface Props {
  isResolving: boolean
  onSubmit: (url: string) => void
}

export const EmbedBlockUrlInput = (props: Props) => {
  const {isResolving, onSubmit} = props
  const [value, setValue] = useState('')

  const submit = () => {
    const trimmed = value.trim()
    if (trimmed) onSubmit(trimmed)
  }

  return (
    <div className='flex items-center gap-2 rounded-md border border-hairline border-dashed bg-surface-well p-3'>
      <LinkIcon className='size-5 shrink-0 text-fg-muted' />
      <input
        autoFocus
        type='url'
        value={value}
        placeholder='Paste a link to embed'
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            e.stopPropagation()
            submit()
          }
        }}
        className='min-w-0 flex-1 rounded-sm border border-hairline-field bg-surface-input px-2 py-1 text-sm outline-hidden focus:border-accent'
      />
      <Button
        variant='secondary'
        size='sm'
        disabled={!value.trim() || isResolving}
        onClick={submit}
      >
        {isResolving ? 'Loading…' : 'Embed'}
      </Button>
    </div>
  )
}
