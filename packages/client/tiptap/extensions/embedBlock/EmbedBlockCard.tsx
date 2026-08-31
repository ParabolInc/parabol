import {Public as PublicIcon} from '~/ui/icons'
import {toSafeHref} from '../../../shared/embed/normalizeEmbedUrl'
import type {EmbedBlockAttrs} from '../../../shared/tiptap/extensions/EmbedBlockBase'

interface Props {
  attrs: EmbedBlockAttrs
}

export const EmbedBlockCard = (props: Props) => {
  const {attrs} = props
  const {url, title, description, thumbnailUrl, faviconUrl, providerName} = attrs
  const href = toSafeHref(url)
  let hostname = url
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '')
  } catch {
    // a malformed url still deserves a rendered card
  }

  return (
    <a
      href={href ?? undefined}
      target='_blank'
      rel='noopener noreferrer'
      className='flex w-full overflow-hidden rounded-md border border-hairline bg-surface-card no-underline transition-colors hover:bg-surface-hover'
    >
      <div className='flex min-w-0 flex-1 flex-col justify-center gap-1 p-3'>
        <div className='truncate font-semibold text-fg-primary text-sm'>{title || hostname}</div>
        {description ? (
          <div className='line-clamp-2 text-fg-secondary text-xs'>{description}</div>
        ) : null}
        <div className='flex items-center gap-1.5 pt-1'>
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt=''
              referrerPolicy='no-referrer'
              loading='lazy'
              className='size-4 rounded-xs'
            />
          ) : (
            <PublicIcon className='size-4 text-fg-muted' />
          )}
          <span className='truncate text-fg-muted text-xs'>{providerName || hostname}</span>
        </div>
      </div>
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt=''
          referrerPolicy='no-referrer'
          loading='lazy'
          className='hidden h-[120px] w-[200px] shrink-0 object-cover sm:block'
        />
      ) : null}
    </a>
  )
}
