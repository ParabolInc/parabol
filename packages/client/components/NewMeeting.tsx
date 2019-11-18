import React, {useEffect, useState} from 'react'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import NewMeetingExistingMeetings from './NewMeetingExistingMeetings'
import NewMeetingTeamPicker from './NewMeetingTeamPicker'
import NewMeetingMeetingSelector from './NewMeetingMeetingSelector'
import {MeetingTypeEnum} from '../types/graphql'
import NewMeetingSettings from './NewMeetingSettings'
import sortByTier from '../utils/sortByTier'
import useRouter from '../hooks/useRouter'
import NewMeetingActions from './NewMeetingActions'

interface Props {
  teamId?: string | null
}

const NewMeetingBlock = styled('div')({

})

const NewMeeting = (props: Props) => {
  const {teamId, viewer} = props
  const {teams} = viewer
  const {history} = useRouter()
  useEffect(() => {
    if (!teamId) {
      const [firstTeam] = sortByTier(teams)
      const nextPath = firstTeam ? `/new-meeting/${firstTeam.id}` : '/newteam'
      history.replace(nextPath)
    }
  }, [])
  if (!teamId) return null
  const selectedTeam = teams.find((team) => team.id === teamId)
  // for now, the sortOrder of the meeting selector should be fixed
  // meeting type should be stored in state here
  const [meetingType, setMeetingType] = useState(MeetingTypeEnum.retrospective)
  return (
    <NewMeetingBlock>
      <NewMeetingExistingMeetings viewer={viewer}/>
      <NewMeetingTeamPicker selectedTeam={selectedTeam} teams={teams}/>
      <NewMeetingMeetingSelector meetingType={meetingType} setMeetingType={setMeetingType}/>
      <NewMeetingSettings teamId={teamId} meetingType={meetingType}/>
      <NewMeetingActions/>
    </NewMeetingBlock>
  )
}

export default createFragmentContainer(
  NewMeeting,
  {
    viewer: graphql`
    fragment NewMeeting_viewer on User {
      ...NewMeetingExistingMeetings_viewer
      teams {
        ...NewMeetingTeamPicker_selectedTeam
        ...NewMeetingTeamPicker_teams
        id
      }
    }`
  }
