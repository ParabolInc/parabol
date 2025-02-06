import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
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
  const data = useLazyLoadQuery<InviteToTeamModalQuery>(
    graphql`
      query InviteToTeamModalQuery {
        viewer {
          teams {
            ...useInviteToTeam_team
            id
            name
          }
        }
      }
    `,
    {}
  )

  const {viewer} = data
  const {teams} = viewer

  const [selectedTeam, setSelectedTeam] = useState<NonNullable<typeof teams>[number]>()
  const channel = useCurrentChannel()

  useEffect(() => {
    if (!selectedTeam && teams && teams.length > 0) {
      setSelectedTeam(teams[0])
    }
  }, [teams, selectedTeam])

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
      {teams ? (
        <Select
          label='Parabol Team'
          required={true}
          options={teams ?? []}
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
