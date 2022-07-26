import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {mod} from 'react-swipeable-views-core'
import useUsageSnackNag from '~/hooks/useUsageSnackNag'
import {PALETTE} from '~/styles/paletteV3'
import {NonEmptyArray} from '~/types/generics'
import {MeetingTypeEnum, NewMeetingQuery} from '~/__generated__/NewMeetingQuery.graphql'
import useBreakpoint from '../hooks/useBreakpoint'
import useRouter from '../hooks/useRouter'
import {Elevation} from '../styles/elevation'
import {Breakpoint, Radius} from '../types/constEnums'
import sortByTier from '../utils/sortByTier'
import DialogContainer from './DialogContainer'
import DialogTitle from './DialogTitle'
import FlatButton from './FlatButton'
import IconLabel from './IconLabel'
import NewMeetingActions from './NewMeetingActions'
import NewMeetingCarousel from './NewMeetingCarousel'
import NewMeetingSettings from './NewMeetingSettings'
import NewMeetingTeamPicker from './NewMeetingTeamPicker'

interface Props {
  teamId?: string | null
  queryRef: PreloadedQuery<NewMeetingQuery>
  onClose: () => void
}

const MEDIA_QUERY_FUZZY_TABLET = `@media screen and (max-width: ${Breakpoint.FUZZY_TABLET}px)`

const TeamAndSettings = styled('div')<{isDesktop}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gridArea: 'settings',
  marginTop: isDesktop ? 32 : 16,
  minHeight: 166
}))

const TeamAndSettingsInner = styled('div')({
  borderRadius: '4px',
  boxShadow: Elevation.Z1
})

const NewMeetingDialog = styled(DialogContainer)({
  width: '860px',
  maxHeight: 'unset',
  borderRadius: Radius.FIELD
})

const Title = styled(DialogTitle)({
  fontSize: 24,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 16px 16px 24px',
  [MEDIA_QUERY_FUZZY_TABLET]: {
    padding: '8px 8px 7px 16px'
  }
})

const CloseButton = styled(FlatButton)({
  padding: 8,
  color: PALETTE.SLATE_600
})

const NewMeetingInner = styled('div')({
  height: '100%',
  maxHeight: 640,
  maxWidth: 1400,
  padding: 0,

  [MEDIA_QUERY_FUZZY_TABLET]: {
    display: 'block',
    padding: 0
  }
})

const createMeetingOrder = ({standups}: {standups: boolean}) => {
  const meetingOrder: NonEmptyArray<MeetingTypeEnum> = ['poker', 'retrospective', 'action']

  if (standups) {
    meetingOrder.push('teamPrompt')
  }

  return meetingOrder
}

const query = graphql`
  query NewMeetingQuery {
    viewer {
      featureFlags {
        standups
        insights
      }
      teams {
        ...NewMeetingTeamPicker_selectedTeam
        ...NewMeetingSettings_selectedTeam
        ...NewMeetingTeamPicker_teams
        ...NewMeetingActions_team
        id
        lastMeetingType
        name
        tier
      }
    }
  }
`

const NewMeeting = (props: Props) => {
  const {teamId, queryRef, onClose} = props
  const data = usePreloadedQuery<NewMeetingQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const {teams, featureFlags} = viewer
  const {insights} = featureFlags
  const newMeetingOrder = useMemo(() => createMeetingOrder(featureFlags), [featureFlags])

  const {history, location} = useRouter()
  const [idx, setIdx] = useState(0)
  useUsageSnackNag(insights)
  const meetingType = newMeetingOrder[mod(idx, newMeetingOrder.length)] as MeetingTypeEnum
  const sendToMeRef = useRef(false)
  useEffect(() => {
    if (!teamId) {
      sendToMeRef.current = true
      const [firstTeam] = sortByTier(teams)
      const nextPath = firstTeam ? `/new-meeting/${firstTeam.id}` : '/newteam'
      history.replace(nextPath, location.state)
    }
  }, [])
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_GRID)
  const selectedTeam = teams.find((team) => team.id === teamId)
  useEffect(() => {
    if (!selectedTeam) return
    const {lastMeetingType} = selectedTeam
    const meetingIdx = newMeetingOrder.indexOf(lastMeetingType)
    setIdx(meetingIdx)
  }, [])
  if (!teamId || !selectedTeam) return null
  return (
    <NewMeetingDialog>
      <Title>
        New meeting
        <CloseButton onClick={onClose}>
          <IconLabel icon='close' iconLarge />
        </CloseButton>
      </Title>
      <NewMeetingInner>
        <NewMeetingCarousel idx={idx} setIdx={setIdx} newMeetingOrder={newMeetingOrder} />
        <TeamAndSettings isDesktop={isDesktop}>
          <TeamAndSettingsInner>
            <NewMeetingTeamPicker selectedTeam={selectedTeam} teams={teams} />
            <NewMeetingSettings selectedTeam={selectedTeam} meetingType={meetingType} />
          </TeamAndSettingsInner>
        </TeamAndSettings>
      </NewMeetingInner>
      <NewMeetingActions team={selectedTeam} meetingType={meetingType} onClose={onClose} />
    </NewMeetingDialog>
  )
}

export default NewMeeting
