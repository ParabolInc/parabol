import {TeamColumnsContainer_viewer} from '../../../../__generated__/TeamColumnsContainer_viewer.graphql'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import TaskColumns from '../../../../components/TaskColumns/TaskColumns'
import {AreaEnum} from '../../../../types/graphql'
import toTeamMemberId from '../../../../utils/relay/toTeamMemberId'
import useAtmosphere from '../../../../hooks/useAtmosphere'

interface Props {
  viewer: TeamColumnsContainer_viewer
}

const TeamColumnsContainer = (props: Props) => {
  const {viewer} = props
  const {team} = viewer
  const {id: teamId, contentFilter, tasks, teamMembers, teamMemberFilter} = team!
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const teamMemberFilterId = (teamMemberFilter && teamMemberFilter.id) || null
  const filteredTasks = useMemo(() => {
    const contentFilterRegex = new RegExp(contentFilter!, 'i')
    const nodes = tasks.edges.map(({node}) => node)
    const contentFilteredNodes = contentFilter
      ? nodes.filter((task) => {
          return task.contentText && task.contentText.match(contentFilterRegex)
        })
      : nodes

    const teamMemberFilteredNodes = teamMemberFilterId
      ? contentFilteredNodes.filter((node) => node.assignee.id === teamMemberFilterId)
      : contentFilteredNodes

    return teamMemberFilteredNodes.map((node) => ({
      ...node,
      teamMembers
    }))
  }, [contentFilter, tasks.edges, teamMemberFilterId, teamMembers])

  return (
    <TaskColumns
      myTeamMemberId={toTeamMemberId(teamId, viewerId)}
      tasks={filteredTasks}
      teamMemberFilterId={teamMemberFilterId}
      area={AreaEnum.teamDash}
    />
  )
}

export default createFragmentContainer(TeamColumnsContainer, {
  viewer: graphql`
    fragment TeamColumnsContainer_viewer on User {
      team(teamId: $teamId) {
        id
        contentFilter
        teamMemberFilter {
          id
        }
        teamMembers(sortBy: "preferredName") {
          id
          picture
          preferredName
        }
        tasks(first: 1000) @connection(key: "TeamColumnsContainer_tasks") {
          edges {
            node {
              ...TaskColumns_tasks
              # grab these so we can sort correctly
              id
              content @__clientField(handle: "contentText")
              contentText
              status
              sortOrder
              assignee {
                id
              }
            }
          }
        }
      }
    }
  `
})
