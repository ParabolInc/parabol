import CardButton from '~/components/CardButton'
import IconLabel from '~/components/IconLabel'
import {Menu} from '~/ui/Menu/Menu'
import TimelineEventHeaderMenu from './TimelineEventHeaderMenu'

interface Props {
  timelineEventId: string
}

const TimelineEventHeaderMenuToggle = (props: Props) => {
  const {timelineEventId} = props
  return (
    <div className='flex justify-end'>
      <Menu
        trigger={
          <CardButton>
            <IconLabel icon='more_vert' />
          </CardButton>
        }
      >
        <TimelineEventHeaderMenu timelineEventId={timelineEventId} />
      </Menu>
    </div>
  )
}

export default TimelineEventHeaderMenuToggle
