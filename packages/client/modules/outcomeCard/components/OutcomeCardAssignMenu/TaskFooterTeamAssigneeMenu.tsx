import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {type PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import type {TaskFooterTeamAssigneeMenu_viewerIntegrationsQuery} from '~/__generated__/TaskFooterTeamAssigneeMenu_viewerIntegrationsQuery.graphql'
import {EmptyDropdownMenuItemLabel} from '~/components/EmptyDropdownMenuItemLabel'
import useSearchFilter from '~/hooks/useSearchFilter'
import {useQueryParameterParser} from '~/utils/useQueryParameterParser'
import type {TaskFooterTeamAssigneeMenu_task$key} from '../../../../__generated__/TaskFooterTeamAssigneeMenu_task.graphql'
import type {TaskFooterTeamAssigneeMenuQuery} from '../../../../__generated__/TaskFooterTeamAssigneeMenuQuery.graphql'
import DropdownMenuLabel from '../../../../components/DropdownMenuLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import ChangeTaskTeamMutation from '../../../../mutations/ChangeTaskTeamMutation'
import {MenuItem} from '../../../../ui/Menu/MenuItem'
import {MenuSearch} from '../../../../ui/Menu/MenuSearch'
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

  const handleTaskUpdate = (nextTeam: {id: string; name: string}) => async () => {
    if (submitting || teamId === nextTeam.id) return
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

  const {
    query: searchQuery,
    filteredItems: matchedAssignableTeams,
    onQueryChange
  } = useSearchFilter(assignableTeams, (team) => team.name)

  return (
    <>
      <DropdownMenuLabel>Move to:</DropdownMenuLabel>
      {assignableTeams.length > 5 && (
        <MenuSearch placeholder='Search teams' onChange={onQueryChange} value={searchQuery} />
      )}
      {matchedAssignableTeams.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No teams found!</EmptyDropdownMenuItemLabel>
      )}
      {matchedAssignableTeams.map((team) => {
        return (
          <MenuItem key={team.id} onClick={handleTaskUpdate(team)}>
            {team.name}
          </MenuItem>
        )
      })}
    </>
  )
}

export default TaskFooterTeamAssigneeMenu
