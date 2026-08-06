import CardButton from '~/components/CardButton'
import IconLabel from '~/components/IconLabel'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import TimelineEventHeaderMenu from './TimelineEventHeaderMenu'

interface Props {
  timelineEventId: string
}

const TimelineEventHeaderMenuToggle = (props: Props) => {
  const {timelineEventId} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  return (
    <div className='flex justify-end'>
      <CardButton ref={originRef} onClick={togglePortal}>
        <IconLabel icon='more_vert' />
      </CardButton>
      {menuPortal(
        <TimelineEventHeaderMenu menuProps={menuProps} timelineEventId={timelineEventId} />
      )}
    </div>
  )
}

export default TimelineEventHeaderMenuToggle
