import {ArrowBack, ArrowForward, BookmarkBorder, MoreVert} from '~/ui/icons'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMovePinnedReportMutation from '../../mutations/useMovePinnedReportMutation'
import useUnpinReportMutation from '../../mutations/useUnpinReportMutation'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MENU_ITEM_ICON, MenuItem} from '../../ui/Menu/MenuItem'

interface Props {
  orgId: string
  pinId: string
  title: string
  index: number
  pinCount: number
}

const ReportCardMenu = ({orgId, pinId, title, index, pinCount}: Props) => {
  const atmosphere = useAtmosphere()
  const [move] = useMovePinnedReportMutation()
  const [unpin] = useUnpinReportMutation()
  const callbacks = {
    onCompleted: (_response: unknown, errors?: readonly {message: string}[] | null) => {
      if (!errors?.[0]) return
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'pinnedReportError',
        message: errors[0].message,
        autoDismiss: 5
      })
    }
  }
  return (
    <Menu
      trigger={
        <button
          type='button'
          aria-label={`Options for ${title}`}
          className='flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-fg-secondary hover:bg-surface-hover data-[state=open]:bg-surface-hover'
        >
          <MoreVert className='text-[20px]' />
        </button>
      }
    >
      <MenuContent align='end' sideOffset={4}>
        {index > 0 && (
          <MenuItem
            onSelect={() => move({variables: {orgId, pinId, toIndex: index - 1}, ...callbacks})}
          >
            <ArrowBack className={MENU_ITEM_ICON} />
            Move earlier
          </MenuItem>
        )}
        {index < pinCount - 1 && (
          <MenuItem
            onSelect={() => move({variables: {orgId, pinId, toIndex: index + 1}, ...callbacks})}
          >
            <ArrowForward className={MENU_ITEM_ICON} />
            Move later
          </MenuItem>
        )}
        <MenuItem onSelect={() => unpin({variables: {orgId, pinId}, ...callbacks})}>
          <BookmarkBorder className={MENU_ITEM_ICON} />
          Unpin
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}

export default ReportCardMenu
