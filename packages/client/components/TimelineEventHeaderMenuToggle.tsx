import styled from '@emotion/styled'
import CardButton from '~/components/CardButton'
import IconLabel from '~/components/IconLabel'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import TimelineEventHeaderMenu from './TimelineEventHeaderMenu'

const ButtonGroup = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
})

interface Props {
  timelineEventId: string
}

const TimelineEventHeaderMenuToggle = (props: Props) => {
  const {timelineEventId} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  return (
    <ButtonGroup>
      <CardButton ref={originRef} onClick={togglePortal}>
        <IconLabel icon='more_vert' />
      </CardButton>
      {menuPortal(
        <TimelineEventHeaderMenu menuProps={menuProps} timelineEventId={timelineEventId} />
      )}
    </ButtonGroup>
  )
}

export default TimelineEventHeaderMenuToggle
