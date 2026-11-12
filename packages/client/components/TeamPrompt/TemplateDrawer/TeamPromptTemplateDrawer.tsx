import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {TeamPromptTemplateDrawerQuery} from '~/__generated__/TeamPromptTemplateDrawerQuery.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import isTemplateAvailableToTeam from '../../../shared/isTemplateAvailableToTeam'
import TeamPromptSwitchTemplateDialog from './TeamPromptSwitchTemplateDialog'
import TeamPromptTemplateDrawerHeader from './TeamPromptTemplateDrawerHeader'
import TeamPromptTemplateDrawerPinned from './TeamPromptTemplateDrawerPinned'
import TeamPromptTemplateList from './TeamPromptTemplateList'
import TeamPromptTemplateProblem from './TeamPromptTemplateProblem'
import useSwitchStandupTemplate from './useSwitchStandupTemplate'

interface Props {
  queryRef: PreloadedQuery<TeamPromptTemplateDrawerQuery>
  onClose: () => void
  hideHeader?: boolean
}

const TeamPromptTemplateDrawer = ({queryRef, onClose, hideHeader}: Props) => {
  const {viewer} = usePreloadedQuery<TeamPromptTemplateDrawerQuery>(
    graphql`
      query TeamPromptTemplateDrawerQuery($meetingId: ID!, $first: Int!) {
        viewer {
          meeting(meetingId: $meetingId) {
            ... on TeamPromptMeeting {
              id
              endedAt
              template {
                id
              }
              team {
                id
                orgId
                name
                organization {
                  name
                }
              }
              meetingSeries {
                cancelledAt
              }
              responses {
                userId
                plaintextContent
              }
            }
          }
          availableTemplates(first: $first, type: teamPrompt) {
            edges {
              node {
                ...TeamPromptTemplateCard_template
                id
                name
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
  const {viewerId} = useAtmosphere()
  const meeting = viewer.meeting
  const [isSeriesChecked, setIsSeriesChecked] = useState(false)
  const isSeriesActive = !!meeting?.meetingSeries && !meeting.meetingSeries.cancelledAt
  const switcher = useSwitchStandupTemplate({
    meetingId: meeting?.id ?? '',
    applyToSeries: isSeriesActive && isSeriesChecked,
    onSwitched: onClose
  })
  const isEnded = !!meeting?.endedAt
  useEffect(() => {
    if (isEnded) onClose()
  }, [isEnded])
  if (!meeting?.team || isEnded) return null
  const {team} = meeting
  const answeredUserIds = new Set(
    (meeting.responses ?? [])
      .filter(({plaintextContent}) => !!plaintextContent.trim())
      .map(({userId}) => userId)
  )
  const answeredCount = answeredUserIds.size
  const youAnswered = answeredUserIds.has(viewerId)
  const templates = (viewer.availableTemplates?.edges ?? [])
    .map(({node}) => node)
    .filter((node) => !switcher.unavailableIds.includes(node.id))
    .filter((node) => isTemplateAvailableToTeam(node, team))

  const pick = (template: {id: string; name: string}) => {
    if (template.id === meeting.template?.id || switcher.pendingTemplateId) return
    if (answeredCount > 0) {
      switcher.askToConfirm({templateId: template.id, templateName: template.name, answeredCount})
      return
    }
    switcher.submit(template, false)
  }
  const confirm = () => {
    const {confirmation} = switcher
    if (!confirmation) return
    switcher.submit({id: confirmation.templateId, name: confirmation.templateName}, true)
  }

  return (
    <div className='flex h-full w-full flex-col bg-surface-drawer'>
      {!hideHeader && <TeamPromptTemplateDrawerHeader onClose={onClose} />}
      <TeamPromptTemplateDrawerPinned
        isSeriesActive={isSeriesActive}
        isSeriesChecked={isSeriesChecked}
        onSeriesCheckedChange={setIsSeriesChecked}
        answeredCount={answeredCount}
        youAnswered={youAnswered}
        hasHeader={!hideHeader}
      />
      {switcher.problem && (
        <TeamPromptTemplateProblem problem={switcher.problem} onRetry={switcher.retry} />
      )}
      <TeamPromptTemplateList
        templates={templates}
        team={team}
        currentTemplateId={meeting.template?.id ?? null}
        pendingTemplateId={switcher.pendingTemplateId}
        onPick={pick}
      />
      <TeamPromptSwitchTemplateDialog
        confirmation={switcher.confirmation}
        youAnswered={youAnswered}
        isSeriesChange={isSeriesActive && isSeriesChecked}
        submitting={switcher.submitting}
        onCancel={switcher.cancelConfirmation}
        onConfirm={confirm}
      />
    </div>
  )
}

export default TeamPromptTemplateDrawer
