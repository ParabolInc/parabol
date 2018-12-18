import React from 'react'
import styled from 'react-emotion'
import {PALETTE} from '../styles/paletteV2'
import Header from './AuthPage/Header'
import TeamInvitationDialog from './TeamInvitationDialog'
import BACKGROUND = PALETTE.BACKGROUND
import TEXT = PALETTE.TEXT

interface Props {
  verifiedInvitation: any
}

const PageContainer = styled('div')({
  alignItems: 'center',
  backgroundColor: BACKGROUND.MAIN,
  color: TEXT.MAIN,
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '100%',
  minHeight: '100vh',
  height: '100vh'
})

const CenteredBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center',
  maxWidth: '100%',
  padding: '0 1rem 2rem',
  width: '100%'
})

function TeamInvitation (props: Props) {
  const {verifiedInvitation} = props
  return (
    <PageContainer>
      <Header />
      <CenteredBlock>
        <TeamInvitationDialog verifiedInvitation={verifiedInvitation} />
      </CenteredBlock>
    </PageContainer>
  )
}

export default TeamInvitation
