import graphql from 'babel-plugin-relay/macro'
import React, {Suspense, useEffect, useMemo} from 'react'
import {Modal} from 'react-bootstrap'
import {useDispatch, useSelector} from 'react-redux'
import {useLazyLoadQuery} from 'react-relay'

import useStartMeeting from '../../hooks/useStartMeeting'
import {closeStartActivityModal} from '../../reducers'
import {getAssetsUrl} from '../../selectors'

import Select from '../Select'
import MeetingSettings from './MeetingSettings'

import styled from 'styled-components'
import {StartActivityModalQuery} from '../../__generated__/StartActivityModalQuery.graphql'
import LoadingSpinner from '../LoadingSpinner'

const SettingsArea = styled.div!`
  min-height: 80px;
`

const StartActivityModal = () => {
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

  const {config, viewer} = data
  const {availableTemplates, teams} = viewer

  const [selectedTeam, setSelectedTeam] = React.useState<NonNullable<typeof teams>[number]>()
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<NonNullable<typeof availableTemplates.edges>[number]['node']>()

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
    if (!selectedTeam && teams && teams.length > 0) {
      setSelectedTeam(teams[0])
    }
  }, [teams, selectedTeam])
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

  const assetsPath = useSelector(getAssetsUrl)

  return (
    <Modal
      dialogClassName='modal--scroll'
      show={true}
      onHide={handleClose}
      onExited={handleClose}
      bsSize='large'
      backdrop='static'
    >
      <Modal.Header closeButton={true}>
        <Modal.Title>
          <img width={36} height={36} src={`${assetsPath}/parabol.png`} />
          {' Start a Parabol Activity'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <p>
            To see the full details for any activity, visit
            <a href={`${config?.parabolUrl}/activity-library/`} target='_blank' rel='noreferrer'>
              {"Parabol's Activity Library"}
            </a>
          </p>
        </div>
        {teams && (
          <Select
            label='Choose Parabol Team'
            required={true}
            options={teams ?? []}
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
      </Modal.Body>
      <Modal.Footer>
        <button className='btn btn-tertiary cancel-button' onClick={handleClose}>
          Cancel
        </button>
        <button className='btn btn-primary save-button' onClick={handleStart}>
          Start Activity
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default StartActivityModal
