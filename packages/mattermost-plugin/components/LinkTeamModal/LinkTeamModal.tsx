import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useMemo} from 'react'
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
      query LinkTeamModalQuery {
        viewer {
          teams {
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
  const unlinkedTeams = useMemo(() => {
    const {viewer} = data
    return viewer.teams.filter(
      (team) =>
        channel &&
        !team.viewerTeamMember?.integrations.mattermost.linkedChannels.includes(channel.id)
    )
  }, [data, channel])
  const [linkTeam, isLoading] = useLinkTeam()
  const [error, setError] = React.useState<string>()

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
    setError(undefined)
    try {
      await linkTeam(selectedTeam.id)
      handleClose()
    } catch (error) {
      console.error('Link team failed', error)
      setError('Failed to link team')
    }
  }

  if (!isVisible || !channel) {
    return null
  }

  return (
    <Modal
      title={`Link a Parabol Team to ${channel.name}`}
      commitButtonLabel='Link Team'
      handleClose={handleClose}
      handleCommit={handleLink}
      error={error}
      isLoading={isLoading}
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
