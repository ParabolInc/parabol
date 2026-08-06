import Menu from '~/components/Menu'
import MenuItem from '~/components/MenuItem'
import useAtmosphere from '~/hooks/useAtmosphere'
import type {MenuProps} from '~/hooks/useMenu'
import ArchiveTimelineEventMutation from '~/mutations/ArchiveTimelineEventMutation'
import {Archive} from '~/ui/icons'
import MenuItemLabel from './MenuItemLabel'

interface Props {
  menuProps: MenuProps
  timelineEventId: string
}

const TimelineEventHeaderMenu = (props: Props) => {
  const {menuProps, timelineEventId} = props
  const atmosphere = useAtmosphere()
  return (
    <Menu ariaLabel={'Change the status of the timeline event'} {...menuProps}>
      <MenuItem
        key='archive'
        label={
          <MenuItemLabel className='w-[200px]'>
            <Archive className='mr-2 text-fg-secondary' />
            <span>{'Archive meeting'}</span>
          </MenuItemLabel>
        }
        onClick={() => ArchiveTimelineEventMutation(atmosphere, {timelineEventId})}
      />
    </Menu>
  )
}

export default TimelineEventHeaderMenu
