import styled from '@emotion/styled'
import {Lock, MailOutline} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {useFragment} from 'react-relay'
import {MeetingLockedOverlay_meeting$key} from '~/__generated__/MeetingLockedOverlay_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import {modalShadow} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {Radius} from '../types/constEnums'
import PrimaryButton from './PrimaryButton'

const DialogOverlay = styled('div')({
  position: 'relative',
  top: 0,
  width: '100%',
  height: '100%',
  backdropFilter: 'blur(3px)',
  zIndex: 100,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  overflowY: 'auto'
})

const DialogContainer = styled('div')({
  display: 'flex',
  backgroundColor: 'white',
  borderRadius: Radius.DIALOG,
  boxShadow: modalShadow,
  flexDirection: 'column',
  marginBottom: 100,
  maxHeight: '90vh',
  maxWidth: 'calc(100vw - 48px)',
  minWidth: 280,
  // width: 512,
  width: '50%',
  alignItems: 'center',
  padding: 24
})

const DialogTitle = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  color: PALETTE.SLATE_700,
  fontSize: 14,
  justifyContent: 'space-around',
  fontWeight: 600,
  lineHeight: '20px',
  margin: '16px 16px 8px',
  paddingTop: 2
})

const DialogBody = styled('div')({
  fontSize: 14,
  lineHeight: '20px',
  textAlign: 'center',
  padding: '4px 68px 16px 68px',
  margin: '8px 0px'
})

const LockIcon = styled(Lock)({
  borderRadius: '100%',
  color: PALETTE.GRAPE_500,
  display: 'block',
  userSelect: 'none',
  height: 40,
  width: 40,
  svg: {
    height: 40,
    width: 40
  }
})

const SentIcon = styled(MailOutline)({
  borderRadius: '100%',
  color: PALETTE.GRAPE_500,
  display: 'block',
  userSelect: 'none',
  height: 40,
  width: 40,
  svg: {
    height: 40,
    width: 40
  }
})

const RequestToJoinComponent = () => {
  const [isRequested, setIsRequested] = React.useState(false)

  const handleRequestJoin = () => {
    // Your logic to send the request goes here.
    setIsRequested(true)
  }

  return (
    <DialogOverlay>
      <DialogContainer>
        {isRequested ? <SentIcon /> : <LockIcon />}
        <DialogTitle>{isRequested ? 'Request Sent' : 'Request to Join'}</DialogTitle>
        <DialogBody>
          {isRequested
            ? 'Your request to join the team has been sent.'
            : "You're not a member of this team yet. Click below to request to join the team."}
        </DialogBody>
        {!isRequested && (
          <PrimaryButton onClick={handleRequestJoin}>{'Request to Join'}</PrimaryButton>
        )}
      </DialogContainer>
    </DialogOverlay>
  )
}

export default RequestToJoinComponent
