import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {useLazyLoadQuery} from 'react-relay'
import {ConfigureNotificationsModalQuery} from '../../__generated__/ConfigureNotificationsModalQuery.graphql'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import {closeConfigureNotificationsModal} from '../../reducers'
import {
  configureNotificationsModalTeam,
  isConfigureNotificationsModalVisible
} from '../../selectors'
import Modal from '../Modal'
import NoLinkedTeamsModal from '../NoLinkedTeamsModal'
import Select from '../Select'
import NotificationSettings from './NotificationSettings'

const ConfigureNotificationsModal = () => {
  const isVisible = useSelector(isConfigureNotificationsModalVisible)
  const defaultTeam = useSelector(configureNotificationsModalTeam)
  const channel = useCurrentChannel()
  const data = useLazyLoadQuery<ConfigureNotificationsModalQuery>(
    graphql`
      query ConfigureNotificationsModalQuery($channel: ID!) {
        viewer {
          teams {
            id
            name
            viewerTeamMember {
              id
              integrations {
                mattermost {
                  linkedChannels
                  teamNotificationSettings(channel: $channel) {
                    id
                    ...NotificationSettings_teamSettings
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      channel: channel?.id ?? ''
    }
  )

  const linkedTeams = useMemo(() => {
    const {viewer} = data
    return viewer.teams.filter(
      (team) =>
        channel &&
        team.viewerTeamMember?.integrations.mattermost.linkedChannels.includes(channel.id)
    )
  }, [data, channel])

  const [selectedTeam, setSelectedTeam] = React.useState<(typeof data.viewer.teams)[number]>()
  const teamSettings =
    selectedTeam?.viewerTeamMember?.integrations.mattermost.teamNotificationSettings

  useEffect(() => {
    if (!selectedTeam && linkedTeams && linkedTeams.length > 0) {
      const foundDefaultTeam = linkedTeams.find((team) => team.id === defaultTeam)
      if (foundDefaultTeam) {
        setSelectedTeam(foundDefaultTeam)
      } else {
        setSelectedTeam(linkedTeams[0])
      }
    }
  }, [linkedTeams, selectedTeam])

  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(closeConfigureNotificationsModal())
  }

  if (!isVisible || !channel) {
    return null
  }

  if (!linkedTeams || linkedTeams.length === 0) {
    return (
      <NoLinkedTeamsModal
        title={`Configure notifications for ${channel.name}`}
        handleClose={handleClose}
      />
    )
  }

  return (
    <Modal
      title={`Configure notifications for ${channel.name}`}
      handleClose={handleClose}
      commitButtonLabel='Done'
    >
      <Select
        label='Choose Parabol Team'
        required={true}
        value={selectedTeam}
        options={linkedTeams}
        onChange={setSelectedTeam}
      />
      {teamSettings && <NotificationSettings settings={teamSettings} />}
    </Modal>
  )
}

export default ConfigureNotificationsModal
