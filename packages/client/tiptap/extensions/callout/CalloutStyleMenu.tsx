import type {Editor} from '@tiptap/core'
import {useState} from 'react'
import type {CalloutTone} from '../../../shared/tiptap/calloutTones'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {CalloutIconButton} from './CalloutIconButton'
import {CalloutStyleItems} from './CalloutStyleItems'

interface Props {
  editor: Editor
  getPos: () => number | undefined
  tone: CalloutTone
  emoji: string | null
  hasTitle: boolean
}

export const CalloutStyleMenu = (props: Props) => {
  const {editor, getPos, tone, emoji, hasTitle} = props
  const [isOpen, setIsOpen] = useState(false)
  const pos = isOpen ? getPos() : undefined
  return (
    <Menu
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={<CalloutIconButton tone={tone} emoji={emoji} />}
    >
      <MenuContent align='start' sideOffset={4} collisionPadding={8} className='z-50 max-h-80'>
        {pos !== undefined && (
          <CalloutStyleItems
            editor={editor}
            pos={pos}
            tone={tone}
            emoji={emoji}
            hasTitle={hasTitle}
            onClose={() => setIsOpen(false)}
          />
        )}
      </MenuContent>
    </Menu>
  )
}
