import graphql from 'babel-plugin-relay/macro'
import {Suspense, useEffect, useMemo, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useLazyLoadQuery} from 'react-relay'

import useStartMeeting from '../../hooks/useStartMeeting'
import {closeStartActivityModal} from '../../reducers'

import Select from '../Select'
import MeetingSettings from './MeetingSettings'

import styled from 'styled-components'
import {StartActivityModalQuery} from '../../__generated__/StartActivityModalQuery.graphql'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import LoadingSpinner from '../LoadingSpinner'
import Modal from '../Modal'
import NoLinkedTeamsModal from '../NoLinkedTeamsModal'

const SettingsArea = styled.div!`
  min-height: 80px;
`

const StartActivityModal = () => {
  const channel = useCurrentChannel()
  const data = useLazyLoadQuery<StartActivityModalQuery>(
    graphql`
      query StartActivityModalQuery {
        config {
          parabolUrl
        }
        viewer {
          availableTemplates(first: 2000) {
            edges {
              node {
                id
                name
                type
                illustrationUrl
                orgId
                teamId
                scope
              }
            }
          }
          teams {
            id
            name
            orgId
            viewerTeamMember {
              id
              integrations {
                mattermost {
                  linkedChannels
                }
              }
            }
            teamMembers {
              id
              email
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

  const {config, viewer} = data
  const {availableTemplates} = viewer

  const [selectedTeam, setSelectedTeam] = useState<NonNullable<typeof linkedTeams>[number]>()
  const [selectedTemplate, setSelectedTemplate] =
    useState<NonNullable<typeof availableTemplates.edges>[number]['node']>()

  const filteredTemplates = useMemo(
    () =>
      availableTemplates.edges
        .map(({node}) => node)
        .filter(
          (template) =>
            template.scope === 'PUBLIC' ||
            (template.scope === 'TEAM' && template.teamId === selectedTeam?.id) ||
            (template.scope === 'ORGANIZATION' && template.orgId === selectedTeam?.orgId)
        ),
    [availableTemplates, selectedTeam]
  )

  useEffect(() => {
    if (!selectedTeam && linkedTeams && linkedTeams.length > 0) {
      setSelectedTeam(linkedTeams[0])
    }
  }, [linkedTeams, selectedTeam])
  useEffect(() => {
    if (!selectedTemplate && filteredTemplates && filteredTemplates.length > 0) {
      setSelectedTemplate(filteredTemplates[0])
    }
  }, [filteredTemplates, selectedTemplate])

  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(closeStartActivityModal())
  }

  const [startMeeting, {isLoading: isStartActivityLoading}] = useStartMeeting()

  const handleStart = async () => {
    if (!selectedTeam || !selectedTemplate) {
      return
    }
    if (isStartActivityLoading) {
      return
    }

    startMeeting(selectedTeam.id, selectedTemplate.type, selectedTemplate.id)

    handleClose()
  }

  if (!linkedTeams || linkedTeams.length === 0) {
    return <NoLinkedTeamsModal title='Start a Parabol Activity' handleClose={handleClose} />
  }

  return (
    <Modal
      title='Start a Parabol Activity'
      commitButtonLabel='Start Activity'
      handleClose={handleClose}
      handleCommit={handleStart}
    >
      <div>
        <p>
          To see the full details for any activity, visit{' '}
          <a href={`${config?.parabolUrl}/activity-library/`} target='_blank' rel='noreferrer'>
            {"Parabol's Activity Library"}
          </a>
        </p>
      </div>
      {linkedTeams && (
        <Select
          label='Choose Parabol Team'
          required={true}
          options={linkedTeams}
          value={selectedTeam}
          onChange={setSelectedTeam}
        />
      )}
      {selectedTeam && availableTemplates && (
        <>
          <Select
            label='Choose Activity'
            required={true}
            options={filteredTemplates ?? []}
            value={selectedTemplate}
            onChange={setSelectedTemplate}
          />
          <SettingsArea>
            {selectedTeam &&
              selectedTemplate &&
              ['retrospective', 'action', 'poker'].includes(selectedTemplate.type) && (
                <Suspense fallback=<LoadingSpinner />>
                  <MeetingSettings teamId={selectedTeam.id} meetingType={selectedTemplate.type} />
                </Suspense>
              )}
          </SettingsArea>
        </>
      )}
    </Modal>
  )
}

export default StartActivityModal
