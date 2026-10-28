import type {ReactNode} from 'react'
import {BrokenImage as BrokenImageIcon} from '~/ui/icons'

interface Props {
  src: string
  title: string
  description: string
  onClick: () => void
  action?: ReactNode
}

export const ImageBlockPlaceholder = (props: Props) => {
  const {src, title, description, onClick, action} = props
  let displayUrl = src
  try {
    const parsed = new URL(src)
    displayUrl = parsed.hostname + parsed.pathname
  } catch {
    // keep raw src
  }
  const isSafeUrl = /^https?:\/\//i.test(src)
  return (
    <div
      contentEditable={false}
      onClick={onClick}
      className='w-full rounded-md border border-hairline bg-surface-raised px-4 py-3'
    >
      <div className='flex items-start gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-well'>
          <BrokenImageIcon className='size-5 text-fg-muted' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='font-medium text-fg-primary text-sm'>{title}</p>
          <p className='mt-0.5 text-fg-muted text-xs'>{description}</p>
          {action ? (
            action
          ) : isSafeUrl ? (
            <a
              href={src}
              target='_blank'
              rel='noopener noreferrer'
              className='mt-1 block truncate text-accent text-xs underline decoration-accent/40 hover:text-sky-600'
              onClick={(e) => e.stopPropagation()}
            >
              {displayUrl}
            </a>
          ) : (
            <span className='mt-1 block truncate text-fg-muted text-xs'>{displayUrl}</span>
          )}
        </div>
      </div>
    </div>
  )
}
