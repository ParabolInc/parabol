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
import NoLinkedTeamsModal from '../NoLinkedTeamsModal'

const InviteToMeetingModal = () => {
  const channel = useCurrentChannel()
  const data = useLazyLoadQuery<InviteToMeetingModalQuery>(
    graphql`
      query InviteToMeetingModalQuery {
        viewer {
          teams {
            id
            viewerTeamMember {
              id
              integrations {
                mattermost {
                  linkedChannels
                }
              }
            }
            activeMeetings {
              ...useInviteToMeeting_meeting
              id
              name
            }
          }
        }
      }
    `,
    {}
  )

  const linkedTeams = useMemo(() => {
    const {viewer} = data
    return viewer.teams.filter(
      (team) =>
        channel &&
        team.viewerTeamMember?.integrations.mattermost.linkedChannels.includes(channel.id)
    )
  }, [data, channel])

  const {viewer} = data
  const {teams} = viewer

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

  if (!linkedTeams || linkedTeams.length === 0) {
    return <NoLinkedTeamsModal title='Invite Channel to Join Activity' handleClose={handleClose} />
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
