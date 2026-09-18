import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {type PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import type {TaskFooterTeamAssigneeMenu_viewerIntegrationsQuery} from '~/__generated__/TaskFooterTeamAssigneeMenu_viewerIntegrationsQuery.graphql'
import {useQueryParameterParser} from '~/utils/useQueryParameterParser'
import type {TaskFooterTeamAssigneeMenu_task$key} from '../../../../__generated__/TaskFooterTeamAssigneeMenu_task.graphql'
import type {TaskFooterTeamAssigneeMenuQuery} from '../../../../__generated__/TaskFooterTeamAssigneeMenuQuery.graphql'
import TeamPickerMenuContent from '../../../../components/TeamPicker/TeamPickerMenuContent'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import ChangeTaskTeamMutation from '../../../../mutations/ChangeTaskTeamMutation'
import {hasJiraScopes} from '../../../../utils/atlassianScopes'

const query = graphql`
  query TaskFooterTeamAssigneeMenu_viewerIntegrationsQuery($teamId: ID!) {
    viewer {
      id
      teamMember(teamId: $teamId) {
        id
        integrations {
          id
          atlassian {
            isActive
            scope
          }
          github {
            isActive
          }
        }
      }
    }
  }
`

export type PendingTeamAssignment = {
  id: string
  name: string
  serviceName: string
}

interface Props {
  queryRef: PreloadedQuery<TaskFooterTeamAssigneeMenuQuery>
  task: TaskFooterTeamAssigneeMenu_task$key
  onRequestIntegration: (pending: PendingTeamAssignment) => void
}

const gqlQuery = graphql`
  query TaskFooterTeamAssigneeMenuQuery {
    viewer {
      id
      teams {
        ...TeamPickerMenuContent_teams
        id
        name
        teamMembers(sortBy: "preferredName") {
          userId
        }
      }
    }
  }
`

const TaskFooterTeamAssigneeMenu = (props: Props) => {
  const {task: taskRef, queryRef, onRequestIntegration} = props
  const data = usePreloadedQuery<TaskFooterTeamAssigneeMenuQuery>(gqlQuery, queryRef)
  const {viewer} = data

  const {userIds, teamIds} = useQueryParameterParser(viewer.id)

  const task = useFragment(
    graphql`
      fragment TaskFooterTeamAssigneeMenu_task on Task {
        id
        team {
          id
        }
        integration {
          __typename
        }
      }
    `,
    taskRef
  )
  const {team, id: taskId, integration} = task
  const isGitHubTask = integration?.__typename === '_xGitHubIssue'
  const isJiraTask = integration?.__typename === 'JiraIssue'

  const {id: teamId} = team
  const {teams} = viewer
  const assignableTeams = useMemo(() => {
    if (userIds) {
      return teams.filter(
        ({teamMembers}) => !!teamMembers.find(({userId}) => userIds.includes(userId))
      )
    }
    if (teamIds) {
      return teams.filter(({id}) => teamIds.includes(id))
    }
    return teams
  }, [teamIds, userIds])

  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()

  const handleTaskUpdate = async (nextTeamId: string) => {
    const nextTeam = assignableTeams.find((team) => team.id === nextTeamId)
    if (!nextTeam || submitting || teamId === nextTeam.id) return
    if (isGitHubTask || isJiraTask) {
      const result =
        await atmosphere.fetchQuery<TaskFooterTeamAssigneeMenu_viewerIntegrationsQuery>(query, {
          teamId: nextTeam.id
        })
      const safeRes = result instanceof Error ? undefined : result
      const {github, atlassian} = safeRes?.viewer?.teamMember?.integrations ?? {}

      if (
        (isGitHubTask && !github?.isActive) ||
        (isJiraTask && !(atlassian?.isActive && hasJiraScopes(atlassian?.scope)))
      ) {
        onRequestIntegration({...nextTeam, serviceName: isGitHubTask ? 'GitHub' : 'Jira'})
        return
      }
    }
    submitMutation()
    ChangeTaskTeamMutation(atmosphere, {taskId, teamId: nextTeam.id}, {onError, onCompleted})
  }

  return (
    <TeamPickerMenuContent
      header='Move to'
      teamsRef={assignableTeams}
      selectedTeamIds={[teamId]}
      onSelectTeam={handleTaskUpdate}
    />
  )
}

export default TaskFooterTeamAssigneeMenu
