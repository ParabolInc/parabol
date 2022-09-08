import styled from '@emotion/styled'
import {Add as AddIcon} from '@mui/icons-material'
import React, {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useLocation} from 'react-router'
import useRouter from '~/hooks/useRouter'
import {PALETTE} from '~/styles/paletteV3'
import getTeamIdFromPathname from '~/utils/getTeamIdFromPathname'
import useBreakpoint from '../hooks/useBreakpoint'
import {BezierCurve, Breakpoint, ElementWidth, ZIndex} from '../types/constEnums'
import FloatingActionButton from './FloatingActionButton'

const Block = styled('div')({
  position: 'fixed',
  bottom: 16,
  right: 16,
  // hacky, but we need the FAB to show up over the team right nav
  zIndex: ZIndex.SIDE_SHEET
})

const Button = styled(FloatingActionButton)({
  color: '#fff',
  backgroundImage: PALETTE.GRADIENT_TOMATO_600_ROSE_500,
  height: 56,
  padding: 0,
  overflow: 'hidden',
  zIndex: ZIndex.FAB
})

const MeetingIcon = styled('div')<{isExpanded: boolean}>(({isExpanded}) => ({
  margin: 16,
  marginLeft: isExpanded ? 24 : 16,
  marginRight: 16,
  width: 24,
  height: 24,
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  '& svg': {
    stroke: 'white',
    fill: 'white',
    strokeWidth: 0.4
  }
}))

const MeetingLabel = styled('div')<{isExpanded: boolean}>(({isExpanded}) => ({
  fontSize: 16,
  fontWeight: 600,
  textAlign: 'start',
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  transform: `translateX(${isExpanded ? -4 : ElementWidth.NEW_MEETING_FAB}px)`,
  width: isExpanded ? ElementWidth.NEW_MEETING_FAB : 0
}))

interface Props {
  className?: string
}

const StartMeetingFAB = (props: Props) => {
  const {t} = useTranslation()

  const location = useLocation()
  const {className} = props
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const teamId = getTeamIdFromPathname()
  const {history} = useRouter()
  const [isExpanded, setIsExpanded] = useState(true)
  const hoverTimerId = useRef<number | undefined>()
  const initTimerId = useRef<number | undefined>()

  useEffect(() => {
    if (!isDesktop) {
      initTimerId.current = window.setTimeout(() => {
        setIsExpanded(false)
      }, 10000)
    } else if (!isExpanded) {
      setIsExpanded(true)
    }
    return () => {
      window.clearTimeout(initTimerId.current)
      window.clearTimeout(hoverTimerId.current)
    }
  }, [isDesktop])

  const onMouseEnter = () => {
    if (!isDesktop) {
      hoverTimerId.current = window.setTimeout(() => {
        setIsExpanded(true)
      }, 500)
    }
  }
  const onMouseLeave = () => {
    if (!isDesktop) {
      window.clearTimeout(hoverTimerId.current)
      setIsExpanded(false)
    }
  }
  const onClick = () => {
    history.replace(
      t('StartMeetingFAB.NewMeetingTeamId', {
        teamId
      }),
      {backgroundLocation: location}
    )
  }
  // We use the SideBarStartMeetingButton in this case
  if (isDesktop) {
    return null
  }
  return (
    <Block className={className}>
      <Button onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <MeetingIcon isExpanded={isExpanded}>
          <AddIcon />
        </MeetingIcon>
        <MeetingLabel isExpanded={isExpanded}>{t('StartMeetingFAB.AddMeeting')}</MeetingLabel>
      </Button>
    </Block>
  )
}

export default StartMeetingFAB
