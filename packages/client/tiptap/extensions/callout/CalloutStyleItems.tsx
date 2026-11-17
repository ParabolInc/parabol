import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type {ChainedCommands, Editor} from '@tiptap/core'
import {AddReactionOutlined, Close} from '~/ui/icons'
import ReactjiPicker from '../../../components/ReactjiPicker'
import {
  CALLOUT_TONE_LABELS,
  CALLOUT_TONES,
  type CalloutTone,
  toCalloutTone
} from '../../../shared/tiptap/calloutTones'
import {cn} from '../../../ui/cn'
import {MENU_ITEM_ICON, MenuItem} from '../../../ui/Menu/MenuItem'
import {MenuItemCheckbox} from '../../../ui/Menu/MenuItemCheckbox'
import {MenuRadioItem} from '../../../ui/Menu/MenuRadioItem'
import {MenuSeparator} from '../../../ui/Menu/MenuSeparator'
import {MenuSubContent} from '../../../ui/Menu/MenuSubContent'
import {MenuSubTrigger} from '../../../ui/Menu/MenuSubTrigger'
import getReactji from '../../../utils/getReactji'
import {CALLOUT_TONE_STYLES} from './calloutToneStyles'

interface Props {
  editor: Editor
  getPos: () => number | undefined
  tone: CalloutTone
  emoji: string | null
  hasTitle: boolean
  onClose: () => void
}

export const CalloutStyleItems = (props: Props) => {
  const {editor, getPos, tone, emoji, hasTitle, onClose} = props
  const run = (command: (chain: ChainedCommands, pos: number) => ChainedCommands) => {
    const pos = getPos()
    if (pos === undefined || !editor.isEditable) return
    if (editor.state.doc.nodeAt(pos)?.type.name !== 'callout') return
    command(editor.chain(), pos).run()
  }
  const focus = (chain: ChainedCommands) => chain.focus(null, {scrollIntoView: false})
  const {Icon: ToneIcon} = CALLOUT_TONE_STYLES[tone]

  const pickEmoji = (emojiId: string) => {
    run((chain, pos) => chain.setCalloutEmoji(pos, getReactji(emojiId).native))
    onClose()
  }

  return (
    <>
      <DropdownMenu.RadioGroup
        value={tone}
        onValueChange={(value) =>
          run((chain, pos) => chain.setCalloutTone(pos, toCalloutTone(value)))
        }
      >
        {CALLOUT_TONES.map((option) => {
          const {Icon, frameClass, iconClass} = CALLOUT_TONE_STYLES[option]
          return (
            <MenuRadioItem key={option} value={option}>
              <span
                className={cn(
                  'mr-2 flex size-5 items-center justify-center rounded-sm border',
                  frameClass
                )}
              >
                <Icon className={cn('text-[14px]', iconClass)} />
              </span>
              {CALLOUT_TONE_LABELS[option]}
            </MenuRadioItem>
          )
        })}
      </DropdownMenu.RadioGroup>
      <MenuSeparator />
      <MenuItemCheckbox
        checked={hasTitle}
        onCheckedChange={() => run((chain, pos) => focus(chain.toggleCalloutTitle(pos)))}
      >
        Title
      </MenuItemCheckbox>
      {emoji ? (
        <MenuItem onSelect={() => run((chain, pos) => chain.setCalloutEmoji(pos, null))}>
          <ToneIcon className={MENU_ITEM_ICON} />
          Use the {CALLOUT_TONE_LABELS[tone]} icon
        </MenuItem>
      ) : (
        <DropdownMenu.Sub>
          <MenuSubTrigger>
            <AddReactionOutlined className={MENU_ITEM_ICON} />
            Use an emoji…
          </MenuSubTrigger>
          <MenuSubContent
            className='max-h-none overflow-visible bg-transparent py-0 shadow-none'
            collisionPadding={8}
          >
            <div onKeyDown={(e) => e.key !== 'Escape' && e.stopPropagation()}>
              <ReactjiPicker onClick={pickEmoji} />
            </div>
          </MenuSubContent>
        </DropdownMenu.Sub>
      )}
      <MenuSeparator />
      <MenuItem onSelect={() => run((chain, pos) => focus(chain.unsetCallout(pos)))}>
        <Close className={MENU_ITEM_ICON} />
        <span className='flex flex-col'>
          <span>Remove callout</span>
          <span className='text-fg-muted text-xs'>Keeps what’s inside</span>
        </span>
      </MenuItem>
    </>
  )
}
