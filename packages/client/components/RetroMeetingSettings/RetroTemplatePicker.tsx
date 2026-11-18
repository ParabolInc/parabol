import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {RetroTemplatePickerQuery} from '../../__generated__/RetroTemplatePickerQuery.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useUpdateMeetingTemplateMutation from '../../mutations/useUpdateMeetingTemplateMutation'
import isTemplateAvailableToTeam from '../../shared/isTemplateAvailableToTeam'
import RetroTemplateList from './RetroTemplateList'
import RetroTemplateSearch from './RetroTemplateSearch'

interface Props {
  queryRef: PreloadedQuery<RetroTemplatePickerQuery>
}

const RetroTemplatePicker = ({queryRef}: Props) => {
  const {viewer} = usePreloadedQuery<RetroTemplatePickerQuery>(
    graphql`
      query RetroTemplatePickerQuery($meetingId: ID!, $first: Int!) {
        viewer {
          meeting(meetingId: $meetingId) {
            ... on RetrospectiveMeeting {
              id
              templateId
              reflectionGroups {
                id
              }
              phases {
                id
                phaseType
                stages {
                  id
                  isComplete
                }
              }
              meetingSeries {
                id
                cancelledAt
                templateId
              }
              team {
                id
                name
                orgId
                organization {
                  name
                }
              }
            }
          }
          availableTemplates(first: $first, type: retrospective) {
            edges {
              node {
                ...RetroTemplateList_templates
                id
                orgId
                teamId
                scope
                isActive
              }
            }
          }
        }
      }
    `,
    queryRef
  )
  const atmosphere = useAtmosphere()
  const [updateMeetingTemplate] = useUpdateMeetingTemplateMutation()
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const meeting = viewer.meeting
  if (!meeting?.team || !meeting.phases) return null
  const {id: meetingId, team, meetingSeries, phases} = meeting
  const isRecurring = !!meetingSeries && !meetingSeries.cancelledAt
  const reflectPhase = phases.find(({phaseType}) => phaseType === 'reflect')
  const isReflectDone = !reflectPhase || reflectPhase.stages.every(({isComplete}) => isComplete)
  const isFutureOnly = (meeting.reflectionGroups?.length ?? 0) > 0 || isReflectDone
  const currentTemplateId = isFutureOnly
    ? (meetingSeries?.templateId ?? meeting.templateId)
    : meeting.templateId
  const templates = (viewer.availableTemplates?.edges ?? [])
    .map(({node}) => node)
    .filter((node) => isTemplateAvailableToTeam(node, team))

  const reportMessage = (key: string, message: string) => {
    atmosphere.eventEmitter.emit('addSnackbar', {key, message, autoDismiss: 8})
  }
  const pick = (template: {id: string; name: string}) => {
    if (template.id === currentTemplateId || pendingTemplateId) return
    setPendingTemplateId(template.id)
    updateMeetingTemplate({
      variables: {meetingId: meetingId!, templateId: template.id, applyToSeries: isRecurring},
      onCompleted: (_res, errors) => {
        setPendingTemplateId(null)
        const message = errors?.[0]?.message
        if (message) reportMessage('updateMeetingTemplateError', message)
        else if (isFutureOnly) {
          reportMessage(
            'retroSeriesTemplateChanged',
            `Future meetings in this series will use ${template.name}.`
          )
        }
      },
      onError: (error) => {
        setPendingTemplateId(null)
        reportMessage('updateMeetingTemplateError', error.message)
      }
    })
  }

  return (
    <>
      <RetroTemplateSearch query={query} onQueryChange={setQuery} />
      <RetroTemplateList
        templatesRef={templates}
        team={team}
        query={query}
        currentTemplateId={currentTemplateId ?? null}
        pendingTemplateId={pendingTemplateId}
        onPick={pick}
      />
    </>
  )
}

export default RetroTemplatePicker
