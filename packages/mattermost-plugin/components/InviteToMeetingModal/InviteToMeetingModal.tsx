import graphql from 'babel-plugin-relay/macro'
import {useEffect, useMemo, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useLazyLoadQuery} from 'react-relay'

import {closeInviteToMeetingModal} from '../../reducers'

import Select from '../Select'

import {Client4} from 'mattermost-redux/client'
import {getCurrentUser} from 'mattermost-redux/selectors/entities/common'
import {Post} from 'mattermost-redux/types/posts'
import {PALETTE} from '~/styles/paletteV3'
import {InviteToMeetingModalQuery} from '../../__generated__/InviteToMeetingModalQuery.graphql'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import useMassInvitationToken from '../../hooks/useMassInvitationToken'
import LoadingSpinner from '../LoadingSpinner'
import Modal from '../Modal'

const InviteToMeetingModal = () => {
  const channel = useCurrentChannel()
  const data = useLazyLoadQuery<InviteToMeetingModalQuery>(
    graphql`
      query InviteToMeetingModalQuery($channel: ID!) {
        config {
          parabolUrl
        }
        linkedTeamIds(channel: $channel)
        viewer {
          teams {
            id
            name
            activeMeetings {
              id
              teamId
              name
              meetingType
            }
          }
        }
      }
    `,
    {
      channel: channel.id
    }
  )

  const {viewer, config, linkedTeamIds} = data
  const parabolUrl = config?.parabolUrl
  const {teams} = viewer
  const linkedTeams = useMemo(
    () => viewer.teams.filter((team) => !linkedTeamIds || linkedTeamIds.includes(team.id)),
    [viewer, linkedTeamIds]
  )
  const activeMeetings = useMemo(
    () => linkedTeams.flatMap((team) => team.activeMeetings),
    [linkedTeams]
  )

  const [selectedMeeting, setSelectedMeeting] = useState<(typeof activeMeetings)[number]>()

  useEffect(() => {
    if (!selectedMeeting && activeMeetings && activeMeetings.length > 0) {
      setSelectedMeeting(activeMeetings[0])
    }
  }, [activeMeetings, selectedMeeting])

  const getToken = useMassInvitationToken({
    teamId: selectedMeeting?.teamId,
    meetingId: selectedMeeting?.id
  })

  const currentUser = useSelector(getCurrentUser)

  const dispatch = useDispatch()
  const handleClose = () => {
    dispatch(closeInviteToMeetingModal())
  }

  const handleStart = async () => {
    if (!selectedMeeting) {
      return
    }
    const {name: meetingName, id: meetingId} = selectedMeeting
    const token = await getToken()
    if (!token) {
      return
    }
    const team = linkedTeams.find((team) => team.id === selectedMeeting.teamId)!
    const teamName = team.name
    const inviteUrl = `${parabolUrl}/invitation-link/${token}`
    const meetingUrl = `${parabolUrl}/meet/${meetingId}`
    const {username, nickname, first_name, last_name} = currentUser
    const userName = nickname || username || `${first_name} ${last_name}`
    const props = {
      attachments: [
        {
          fallback: `${userName} invited you to join the meeting ${meetingName}`,
          title: `${userName} invited you to join a meeting in [Parabol](${meetingUrl})`,
          color: PALETTE.GRAPE_500,
          fields: [
            {
              short: true,
              title: 'Team',
              value: teamName
            },
            {
              short: true,
              title: 'Meeting',
              value: meetingName
            },
            {
              short: false,
              value: `
| [Join Meeting](${inviteUrl}) |
|:--------------------:|
||`
            }
          ]
        }
      ]
    }
    Client4.createPost({
      channel_id: channel.id,
      props
    } as Partial<Post> as Post)
    handleClose()
  }

  return (
    <Modal
      title='Invite Channel to Join Activity'
      commitButtonLabel='Share Invite'
      handleCommit={handleStart}
      handleClose={handleClose}
    >
      {teams ? (
        <Select
          label='Activity'
          required={true}
          options={activeMeetings ?? []}
          value={selectedMeeting}
          onChange={setSelectedMeeting}
        />
      ) : (
        <LoadingSpinner />
      )}
    </Modal>
  )
}

export default InviteToMeetingModal
