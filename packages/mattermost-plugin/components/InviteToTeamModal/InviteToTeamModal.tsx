import graphql from 'babel-plugin-relay/macro'
import {useEffect, useMemo, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useLazyLoadQuery} from 'react-relay'

import {closeInviteToTeamModal} from '../../reducers'

import Select from '../Select'

import {InviteToTeamModalQuery} from '../../__generated__/InviteToTeamModalQuery.graphql'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import {useInviteToTeam} from '../../hooks/useInviteToTeam'
import LoadingSpinner from '../LoadingSpinner'
import Modal from '../Modal'

const InviteToTeamModal = () => {
  const channel = useCurrentChannel()
  const data = useLazyLoadQuery<InviteToTeamModalQuery>(
    graphql`
      query InviteToTeamModalQuery {
        viewer {
          teams {
            ...useInviteToTeam_team
            id
            name
            viewerTeamMember {
              id
              integrations {
                mattermost {
                  linkedChannels
                }
              }
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

  const [selectedTeam, setSelectedTeam] = useState<NonNullable<typeof linkedTeams>[number]>()

  useEffect(() => {
    if (!selectedTeam && linkedTeams && linkedTeams.length > 0) {
      setSelectedTeam(linkedTeams[0])
    }
  }, [linkedTeams, selectedTeam])

  const invite = useInviteToTeam(selectedTeam)

  const dispatch = useDispatch()
  const handleClose = () => {
    dispatch(closeInviteToTeamModal())
  }

  const handleStart = async () => {
    if (!selectedTeam || !channel) {
      return
    }
    invite()
    handleClose()
  }

  return (
    <Modal
      title='Invite Channel to Join Parabol Team'
      commitButtonLabel='Share Invite'
      handleCommit={handleStart}
      handleClose={handleClose}
    >
      {linkedTeams ? (
        <Select
          label='Parabol Team'
          required={true}
          options={linkedTeams ?? []}
          value={selectedTeam}
          onChange={setSelectedTeam}
        />
      ) : (
        <LoadingSpinner />
      )}
    </Modal>
  )
}

export default InviteToTeamModal
