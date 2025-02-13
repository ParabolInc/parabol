import graphql from 'babel-plugin-relay/macro'
import {useEffect, useMemo, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useLazyLoadQuery} from 'react-relay'

import {closeInviteToMeetingModal} from '../../reducers'

import Select from '../Select'

import {InviteToMeetingModalQuery} from '../../__generated__/InviteToMeetingModalQuery.graphql'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import {useInviteToMeeting} from '../../hooks/useInviteToMeeting'
import LoadingSpinner from '../LoadingSpinner'
import Modal from '../Modal'

const InviteToMeetingModal = () => {
  const channel = useCurrentChannel()
  const data = useLazyLoadQuery<InviteToMeetingModalQuery>(
    graphql`
      query InviteToMeetingModalQuery($channel: ID!) {
        linkedTeamIds(channel: $channel)
        viewer {
          teams {
            id
            activeMeetings {
              ...useInviteToMeeting_meeting
              id
              name
            }
          }
        }
      }
    `,
    {
      channel: channel?.id ?? ''
    }
  )

  const {viewer, linkedTeamIds} = data
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

  const invite = useInviteToMeeting(selectedMeeting)

  const dispatch = useDispatch()
  const handleClose = () => {
    dispatch(closeInviteToMeetingModal())
  }

  const handleStart = async () => {
    if (!selectedMeeting || !channel) {
      return
    }
    invite?.()
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
