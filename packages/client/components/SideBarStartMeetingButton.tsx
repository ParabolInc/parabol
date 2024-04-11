import styled from '@emotion/styled'
import {Add} from '@mui/icons-material'
import React from 'react'
import useRouter from '~/hooks/useRouter'
import {BezierCurve} from '../types/constEnums'
import FlatPrimaryButton from './FlatPrimaryButton'

const Button = styled(FlatPrimaryButton)<{isOpen: boolean}>(({isOpen}) => ({
  height: 48,
  overflow: 'hidden',
  padding: 0,
  width: isOpen ? 160 : 48,
  marginLeft: 7,
  marginTop: 15,
  marginBottom: 15,
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  justifyContent: 'flex-start'
}))

const MeetingIcon = styled(Add)({
  margin: '0px 11px'
})

const MeetingLabel = styled('div')<{isOpen: boolean}>(({isOpen}) => ({
  fontSize: 16,
  fontWeight: 600,
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  opacity: isOpen ? 1 : 0
}))

const SideBarStartMeetingButton = ({isOpen}: {isOpen: boolean}) => {
  const {history} = useRouter()

  const onClick = () => {
    history.push('/activity-library')
  }
  return (
    <Button isOpen={isOpen} onClick={onClick}>
      <MeetingIcon />
      <MeetingLabel isOpen={isOpen}>Add Meeting</MeetingLabel>
    </Button>
  )
}

export default SideBarStartMeetingButton
