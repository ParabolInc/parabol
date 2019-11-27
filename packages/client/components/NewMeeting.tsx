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

const NewMeetingBlock = styled('div')<{innerWidth: number}>(({innerWidth}) => ({
  display: 'grid',
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
}))

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

const NewMeeting = (props: Props) => {
  const {teamId, viewer} = props
  const {teams} = viewer
  const [meetingType, setMeetingType] = useState(MeetingTypeEnum.retrospective)
  const {history} = useRouter()
  const innerWidth = useInnerWidth()

  useEffect(() => {
    if (!teamId) {
      const [firstTeam] = sortByTier(teams)
      const nextPath = firstTeam ? `/new-meeting/${firstTeam.id}` : '/newteam'
      history.replace(nextPath)
    }
  }, [])
  const selectedTeam = teams.find((team) => team.id === teamId)
  if (!selectedTeam) return null
  return (
    <NewMeetingBlock innerWidth={innerWidth}>
      <NewMeetingBackButton />
      <NewMeetingIllustration meetingType={meetingType} />
      <BottomLeft>
        <NewMeetingMeetingSelector meetingType={meetingType} setMeetingType={setMeetingType} />
        <NewMeetingTeamPicker selectedTeam={selectedTeam} teams={teams} />
        <NewMeetingSettings selectedTeam={selectedTeam} meetingType={meetingType} />
      </BottomLeft>
      <NewMeetingHowTo meetingType={meetingType} />
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
