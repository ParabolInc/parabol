import styled from '@emotion/styled'
import React from 'react'
import useBreakpoint from '../hooks/useBreakpoint'
import useRouter from '../hooks/useRouter'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {Breakpoint, ZIndex} from '../types/constEnums'
import FloatingActionButton from './FloatingActionButton'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

const BackButtonMobile = styled(PlainButton)({
  background: '#fff',
  height: ICON_SIZE.MD24,
  justifySelf: 'flex-start',
  width: ICON_SIZE.MD24,
  alignSelf: 'flex-start',
  margin: 16,
  zIndex: ZIndex.FAB
})

const BackButtonDesktop = styled(FloatingActionButton)({
  alignSelf: 'flex-start',
  background: PALETTE.SLATE_200,
  height: ICON_SIZE.MD40,
  justifySelf: 'flex-start',
  margin: '24px 32px 16px',
  padding: 0,
  width: ICON_SIZE.MD40,
  zIndex: ZIndex.FAB
})

const BackIcon = styled(Icon)({})

interface Props {
  sendToMe: boolean
  teamId: string
}
const NewMeetingBackButton = (props: Props) => {
  const {sendToMe, teamId} = props
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_GRID)
  const BackButton = isDesktop ? BackButtonDesktop : BackButtonMobile
  const {history} = useRouter()
  const onClick = () => {
    const nextRoute = sendToMe ? '/meetings' : `/team/${teamId}`
    history.push(nextRoute)
  }
  return (
    <BackButton onClick={onClick}>
      <BackIcon>arrow_back</BackIcon>
    </BackButton>
  )
}

export default NewMeetingBackButton
