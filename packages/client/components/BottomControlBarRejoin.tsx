import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'

interface Props {
  onClick: () => void
}

const BottomControlBarRejoin = ({onClick}: Props) => {
  return (
    <BottomNavControl onClick={onClick}>
      <BottomNavIconLabel icon='person_pin_circle' iconColor='warm' label={'Rejoin'} />
    </BottomNavControl>
  )
}

export default BottomControlBarRejoin
