import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {Style} from '~/ui/icons'
import {toCalloutTone} from '../../../shared/tiptap/calloutTones'
import {MENU_ITEM_ICON} from '../../../ui/Menu/MenuItem'
import {MenuSeparator} from '../../../ui/Menu/MenuSeparator'
import {MenuSubContent} from '../../../ui/Menu/MenuSubContent'
import {MenuSubTrigger} from '../../../ui/Menu/MenuSubTrigger'
import {CalloutStyleItems} from './CalloutStyleItems'

interface Props {
  editor: Editor
  node: Node
  pos: number
  onClose: () => void
}

export const CalloutStyleSubMenu = ({editor, node, pos, onClose}: Props) => (
  <>
    <DropdownMenu.Sub>
      <MenuSubTrigger>
        <Style className={MENU_ITEM_ICON} />
        Callout style
      </MenuSubTrigger>
      <MenuSubContent className='z-50 max-h-80 min-w-[200px]' collisionPadding={8}>
        <CalloutStyleItems
          editor={editor}
          getPos={() => pos}
          tone={toCalloutTone(node.attrs.tone)}
          emoji={node.attrs.emoji || null}
          hasTitle={node.firstChild?.type.name === 'calloutTitle'}
          onClose={onClose}
        />
      </MenuSubContent>
    </DropdownMenu.Sub>
    <MenuSeparator />
  </>
)
