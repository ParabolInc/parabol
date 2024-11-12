import styled from '@emotion/styled'
import {Add} from '@mui/icons-material'
import useRouter from '~/hooks/useRouter'
import {BezierCurve} from '../types/constEnums'
import FlatPrimaryButton from './FlatPrimaryButton'

const Button = styled(FlatPrimaryButton)<{isOpen: boolean}>(({isOpen}) => ({
  height: 40,
  overflow: 'hidden',
  padding: 0,
  width: isOpen ? 232 : 40,
  marginTop: 16,
  marginBottom: 14, // account for nav margin 2px
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  justifyContent: isOpen ? 'center' : 'flex-start'
}))

const MeetingIcon = styled(Add)({
  margin: '0px 0px 0px 7px'
})

const MeetingLabel = styled('div')<{isOpen: boolean}>(({isOpen}) => ({
  fontSize: 16,
  fontWeight: 600,
  paddingLeft: 4,
  paddingRight: 7,
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  opacity: isOpen ? 1 : 0
}))

const SideBarStartMeetingButton = ({isOpen}: {isOpen: boolean}) => {
  const {history} = useRouter()

  const onClick = () => {
    history.push('/activity-library')
  }
  return (
    <div className='px-3'>
      <Button isOpen={isOpen} onClick={onClick}>
        <MeetingIcon />
        <MeetingLabel isOpen={isOpen}>Add Meeting</MeetingLabel>
      </Button>
    </div>
  )
}

export default SideBarStartMeetingButton
