import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {useLazyLoadQuery} from 'react-relay'
import {LinkTeamModalQuery} from '../../__generated__/LinkTeamModalQuery.graphql'
import {useConfig} from '../../hooks/useConfig'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import {useLinkTeam} from '../../hooks/useLinkTeam'
import {closeLinkTeamModal} from '../../reducers'
import {isLinkTeamModalVisible} from '../../selectors'
import Modal from '../Modal'
import Select from '../Select'

const LinkTeamModal = () => {
  const isVisible = useSelector(isLinkTeamModalVisible)
  const channel = useCurrentChannel()
  const config = useConfig()
  const data = useLazyLoadQuery<LinkTeamModalQuery>(
    graphql`
      query LinkTeamModalQuery($channel: ID!) {
        linkedTeamIds(channel: $channel)
        viewer {
          teams {
            id
            name
          }
        }
      }
    `,
    {
      channel: channel.id
    }
  )
  const {viewer, linkedTeamIds} = data
  const unlinkedTeams = viewer.teams.filter((team) => !linkedTeamIds?.includes(team.id))
  const linkTeam = useLinkTeam()

  const [selectedTeam, setSelectedTeam] = React.useState<(typeof data.viewer.teams)[number]>()

  useEffect(() => {
    if (!selectedTeam && unlinkedTeams && unlinkedTeams.length > 0) {
      setSelectedTeam(unlinkedTeams[0])
    }
  }, [unlinkedTeams, selectedTeam])

  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(closeLinkTeamModal())
  }

  const handleLink = async () => {
    if (!selectedTeam) {
      return
    }
    await linkTeam(selectedTeam.id)
    handleClose()
  }

  if (!isVisible) {
    return null
  }

  return (
    <Modal
      title={`Link a Parabol Team to ${channel.name}`}
      commitButtonLabel='Link Team'
      handleClose={handleClose}
      handleCommit={handleLink}
    >
      {unlinkedTeams && unlinkedTeams.length > 0 ? (
        <>
          <Select
            label='Choose Parabol Team'
            required={true}
            value={selectedTeam}
            options={unlinkedTeams}
            onChange={setSelectedTeam}
          />
        </>
      ) : (
        <>
          <div>
            <p>
              All your teams are already linked to this channel. Visit{' '}
              <a href={`${config?.parabolUrl}/newteam/`}>Parabol</a> to create new teams.
            </p>
          </div>
        </>
      )}
    </Modal>
  )
}

export default LinkTeamModal
