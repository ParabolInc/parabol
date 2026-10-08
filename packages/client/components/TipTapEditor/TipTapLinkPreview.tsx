import {useState} from 'react'
import {Check, ContentCopy, Edit, LinkOff, Public} from '~/ui/icons'
import {TipTapLinkPreviewButton} from './TipTapLinkPreviewButton'

export type Props = {
  url: string
  onEdit: () => void
  onClear: () => void
}

export const TipTapLinkPreview = (props: Props) => {
  const {onClear, onEdit, url} = props
  const [isCopied, setIsCopied] = useState(false)
  const copyLink = async () => {
    await navigator.clipboard.writeText(url)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }
  const displayUrl = url.replace(/^(https?:\/\/|mailto:)/, '').replace(/\/$/, '')
  return (
    <div className='flex items-center rounded-md border border-hairline bg-surface-modal p-[3px] pl-2 text-sm shadow-[var(--shadow-card-raised)]'>
      <Public className='text-[18px] text-fg-secondary' />
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='max-w-56 truncate px-1.5 hover:underline'
      >
        {displayUrl}
      </a>
      <div className='mx-[3px] h-[18px] w-px bg-hairline' />
      <TipTapLinkPreviewButton label='Edit link' onClick={onEdit}>
        <Edit className='text-[1em]' />
      </TipTapLinkPreviewButton>
      <TipTapLinkPreviewButton label={isCopied ? 'Link copied' : 'Copy link'} onClick={copyLink}>
        {isCopied ? <Check className='text-[1em]' /> : <ContentCopy className='text-[1em]' />}
      </TipTapLinkPreviewButton>
      <TipTapLinkPreviewButton label='Remove link' onClick={onClear}>
        <LinkOff className='text-[1em]' />
      </TipTapLinkPreviewButton>
    </div>
  )
}
