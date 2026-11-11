import {NodeViewContent, type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {CALLOUT_TONE_LABELS, toCalloutTone} from '../../../shared/tiptap/calloutTones'
import {cn} from '../../../ui/cn'
import {CalloutStyleMenu} from './CalloutStyleMenu'
import {CalloutToneIcon} from './CalloutToneIcon'
import {CALLOUT_TONE_STYLES} from './calloutToneStyles'

export const CalloutView = (props: NodeViewProps) => {
  const {editor, getPos, node} = props
  const tone = toCalloutTone(node.attrs.tone)
  const emoji: string | null = node.attrs.emoji || null
  const hasTitle = node.firstChild?.type.name === 'calloutTitle'
  return (
    <NodeViewWrapper
      data-type='callout'
      data-tone={tone}
      role='note'
      aria-label={CALLOUT_TONE_LABELS[tone]}
      className={cn(
        'flex gap-2.5 rounded-lg border pt-3 pr-4 pb-3 pl-2.5 text-fg-primary',
        CALLOUT_TONE_STYLES[tone].frameClass
      )}
    >
      <div contentEditable={false} className='flex shrink-0 select-none'>
        {editor.isEditable ? (
          <CalloutStyleMenu
            editor={editor}
            getPos={getPos}
            tone={tone}
            emoji={emoji}
            hasTitle={hasTitle}
          />
        ) : (
          <span className='flex h-[26px] w-7 items-center justify-center'>
            <CalloutToneIcon tone={tone} emoji={emoji} />
          </span>
        )}
      </div>
      <NodeViewContent className='min-w-0 flex-1' />
    </NodeViewWrapper>
  )
}
