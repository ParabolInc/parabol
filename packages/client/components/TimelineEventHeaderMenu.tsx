import useAtmosphere from '~/hooks/useAtmosphere'
import ArchiveTimelineEventMutation from '~/mutations/ArchiveTimelineEventMutation'
import {Archive} from '~/ui/icons'
import {MenuContent} from '~/ui/Menu/MenuContent'
import {MenuItem} from '~/ui/Menu/MenuItem'

interface Props {
  timelineEventId: string
}

const TimelineEventHeaderMenu = (props: Props) => {
  const {timelineEventId} = props
  const atmosphere = useAtmosphere()
  return (
    <MenuContent align='end'>
      <MenuItem
        className='w-[200px]'
        onClick={() => ArchiveTimelineEventMutation(atmosphere, {timelineEventId})}
      >
        <Archive className='mr-2 text-fg-secondary' />
        <span>{'Archive meeting'}</span>
      </MenuItem>
    </MenuContent>
  )
}

export default TimelineEventHeaderMenu
