import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useLazyLoadQuery} from 'react-relay'

import {closeInviteToTeamModal} from '../../reducers'

import Select from '../Select'

import {Client4} from 'mattermost-redux/client'
import {getCurrentUser} from 'mattermost-redux/selectors/entities/common'
import {Post} from 'mattermost-redux/types/posts'
import {InviteToTeamModalQuery} from '../../__generated__/InviteToTeamModalQuery.graphql'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import LoadingSpinner from '../LoadingSpinner'
import Modal from '../Modal'
import useMassInvitationToken from './useMassInvitationToken'

const InviteToTeamModal = () => {
  const data = useLazyLoadQuery<InviteToTeamModalQuery>(
    graphql`
      query InviteToTeamModalQuery {
        config {
          parabolUrl
        }
        viewer {
          teams {
            id
            name
          }
        }
      }
    `,
    {}
  )

  const {viewer, config} = data
  const parabolUrl = config?.parabolUrl
  const {teams} = viewer

  const [selectedTeam, setSelectedTeam] = useState<NonNullable<typeof teams>[number]>()
  const channel = useCurrentChannel()

  useEffect(() => {
    if (!selectedTeam && teams && teams.length > 0) {
      setSelectedTeam(teams[0])
    }
  }, [teams, selectedTeam])

  const getToken = useMassInvitationToken({teamId: selectedTeam?.id})

  const currentUser = useSelector(getCurrentUser)

  const dispatch = useDispatch()
  const handleClose = () => {
    dispatch(closeInviteToTeamModal())
  }

  const handleStart = async () => {
    if (!selectedTeam) {
      return
    }
    const {name: teamName} = selectedTeam
    const token = await getToken()
    if (!token) {
      return
    }
    const url = `${parabolUrl}/invitation-link/${token}`
    const {username, nickname, first_name, last_name} = currentUser
    const userName = nickname || username || `${first_name} ${last_name}`
    const props = {
      attachments: [
        {
          fallback: `Join our team ${teamName}, [Join Team](${url})`,
          fields: [
            {short: true, value: teamName},
            {
              short: false,
              value: `
| [Join Team](${url}) |
|:--------------------:|
||`
            }
          ],
          title: `${userName} invited you to join a team in Parabol`
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
      title='Invite to Parabol Team'
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
