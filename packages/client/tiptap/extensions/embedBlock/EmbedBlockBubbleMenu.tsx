import * as Popover from '@radix-ui/react-popover'
import type {Editor} from '@tiptap/react'
import {
  Article as ArticleIcon,
  AspectRatio as AspectRatioIcon,
  DeleteOutlined as DeleteIcon,
  FormatAlignCenter as FormatAlignCenterIcon,
  FormatAlignLeft as FormatAlignLeftIcon,
  FormatAlignRight as FormatAlignRightIcon,
  Link as LinkIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon
} from '~/ui/icons'
import type {EmbedAspectRatio, EmbedBlockAttrs} from '../../../shared/embed/embedTypes'
import {toSafeHref} from '../../../shared/embed/normalizeEmbedUrl'
import {BubbleMenuButton} from '../imageBlock/BubbleMenuButton'
import {EmbedBlockAspectMenu} from './EmbedBlockAspectMenu'

interface Props {
  editor: Editor
  attrs: EmbedBlockAttrs
  canFrame: boolean
  isOpen: boolean
  isResolving: boolean
  updateAttributes: (attributes: Record<string, any>) => void
  onReload: () => void
  onReplace: () => void
}

const Divider = () => <div className='mx-1 h-4 w-px bg-hairline' />
const alignButtons = [
  {name: 'left' as const, Icon: FormatAlignLeftIcon},
  {name: 'center' as const, Icon: FormatAlignCenterIcon},
  {name: 'right' as const, Icon: FormatAlignRightIcon}
]

export const EmbedBlockBubbleMenu = (props: Props) => {
  const {editor, attrs, canFrame, isOpen, isResolving, updateAttributes, onReload, onReplace} =
    props
  const {align, aspectRatio, isFullWidth, displayMode, url, embedSrc} = attrs

  return (
    <Popover.Root open={isOpen}>
      <Popover.Anchor className='pointer-events-none absolute top-0 h-full w-full' />
      <Popover.Portal>
        <Popover.Content
          className='fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-10 flex animate-in items-center rounded-sm border border-hairline border-solid bg-surface-card p-[3px] shadow-sm'
          sideOffset={8}
          side='top'
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className='flex rounded-sm'>
            {alignButtons.map(({name, Icon}) => (
              <BubbleMenuButton
                key={name}
                onClick={() => updateAttributes({align: name})}
                isActive={align === name}
                Icon={Icon}
                title={`Align ${name}`}
              />
            ))}
          </div>

          <Divider />

          <BubbleMenuButton
            onClick={() => updateAttributes({isFullWidth: !isFullWidth})}
            isActive={isFullWidth}
            Icon={AspectRatioIcon}
            title='Full width'
          />

          <Divider />

          {/* Card is always reachable; embed only when the provider allows framing */}
          <BubbleMenuButton
            onClick={() =>
              updateAttributes({displayMode: displayMode === 'embed' ? 'card' : 'embed'})
            }
            isActive={displayMode === 'card'}
            Icon={ArticleIcon}
            title={displayMode === 'embed' ? 'Show as card' : 'Show as embed'}
          />

          {canFrame && (
            <EmbedBlockAspectMenu
              aspectRatio={aspectRatio as EmbedAspectRatio}
              onSelect={(next) => updateAttributes({aspectRatio: next})}
            />
          )}

          <Divider />

          <BubbleMenuButton
            onClick={() => {
              const href = toSafeHref(url)
              if (href) window.open(href, '_blank', 'noopener,noreferrer')
            }}
            Icon={OpenInNewIcon}
            title='Open in new tab'
          />
          <BubbleMenuButton
            onClick={onReload}
            Icon={RefreshIcon}
            title={isResolving ? 'Reloading…' : 'Reload'}
          />
          <BubbleMenuButton onClick={onReplace} Icon={LinkIcon} title='Replace URL' />
          <BubbleMenuButton
            onClick={() => editor.chain().deleteSelection().run()}
            Icon={DeleteIcon}
            title='Delete embed'
          />
          {!embedSrc && <span className='sr-only'>This link cannot be embedded</span>}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
