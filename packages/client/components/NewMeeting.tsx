import React, {useEffect, useState} from 'react'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import NewMeetingTeamPicker from './NewMeetingTeamPicker'
import NewMeetingMeetingSelector from './NewMeetingMeetingSelector'
import {MeetingTypeEnum} from '../types/graphql'
import NewMeetingSettings from './NewMeetingSettings'
import sortByTier from '../utils/sortByTier'
import useRouter from '../hooks/useRouter'
import NewMeetingActions from './NewMeetingActions'
import NewMeetingBackButton from './NewMeetingBackButton'
import WaveSVG from '../../../static/images/wave.svg'
import {NewMeeting_viewer} from '__generated__/NewMeeting_viewer.graphql'
import NewMeetingHowTo from './NewMeetingHowTo'
import NewMeetingIllustration from './NewMeetingIllustration'
import {mod} from 'react-swipeable-views-core'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint} from '../types/constEnums'

interface Props {
  teamId?: string | null
  viewer: NewMeeting_viewer
}

const BottomLeft = styled('div')({
  alignItems: 'center',
  gridRow: 3,
  display: 'flex',
  flexDirection: 'column'
})

const NewMeetingBlock = styled('div')<{innerWidth: number; isDesktop: boolean}>(
  ({innerWidth, isDesktop}) => ({
    display: isDesktop ? 'grid' : 'flex',
    gridTemplateColumns: '5fr 5fr',
    gridTemplateRows: '2fr 5fr 5fr',
    alignItems: 'start',
    backgroundRepeat: 'no-repeat',
    backgroundImage: `url('${WaveSVG}'), linear-gradient(0deg, #F1F0FA 50%, #FFFFFF 50%)`,
    height: '100%',
    backgroundSize: '100%',
    // the wave is 2560x231, so to figure out the offset from the center, we need to find how much scaling there was
    backgroundPositionY: `calc(50% - ${Math.floor(((innerWidth / 2560) * 231) / 2 - 1)}px), 0`,
    justifyItems: 'center'
  })
)

const useInnerWidth = () => {
  const [innerWidth, setInnerWidth] = useState(() => window.innerWidth)
  useEffect(() => {
    const resizeWindow = () => {
      setInnerWidth(window.innerWidth)
    }
    window.addEventListener('resize', resizeWindow, {passive: true})
    return () => {
      window.removeEventListener('resize', resizeWindow)
    }
  }, [])
  return innerWidth
}

export const NEW_MEETING_ORDER = [MeetingTypeEnum.retrospective, MeetingTypeEnum.action]

const NewMeeting = (props: Props) => {
  const {teamId, viewer} = props
  const {teams} = viewer
  const {history} = useRouter()
  const innerWidth = useInnerWidth()
  const [idx, setIdx] = useState(0)
  const meetingType = NEW_MEETING_ORDER[mod(idx, NEW_MEETING_ORDER.length)]
  useEffect(() => {
    if (!teamId) {
      const [firstTeam] = sortByTier(teams)
      const nextPath = firstTeam ? `/new-meeting/${firstTeam.id}` : '/newteam'
      history.replace(nextPath)
    }
  }, [])
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING)
  const selectedTeam = teams.find((team) => team.id === teamId)
  if (!selectedTeam) return null
  return (
    <NewMeetingBlock innerWidth={innerWidth} isDesktop={isDesktop}>
      <NewMeetingBackButton />
      <NewMeetingIllustration idx={idx} setIdx={setIdx} />
      <NewMeetingHowTo meetingType={meetingType} />
      <BottomLeft>
        <NewMeetingMeetingSelector meetingType={meetingType} idx={idx} setIdx={setIdx} />
        <NewMeetingTeamPicker selectedTeam={selectedTeam} teams={teams} />
        <NewMeetingSettings selectedTeam={selectedTeam} meetingType={meetingType} />
      </BottomLeft>
      {/*<NewMeetingExistingMeetings viewer={viewer} />*/}
      <NewMeetingActions viewer={viewer} />
    </NewMeetingBlock>
  )
}

export default createFragmentContainer(NewMeeting, {
  viewer: graphql`
    fragment NewMeeting_viewer on User {
      ...NewMeetingExistingMeetings_viewer
      ...NewMeetingActions_viewer
      teams {
        ...NewMeetingTeamPicker_selectedTeam
        ...NewMeetingSettings_selectedTeam
        ...NewMeetingTeamPicker_teams
        id
        name
        tier
      }
    }
  `
})
