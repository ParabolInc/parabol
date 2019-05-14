import {TeamColumnsContainer_viewer} from '__generated__/TeamColumnsContainer_viewer.graphql'
import React, {useMemo} from 'react'
import {connect} from 'react-redux'
import {createFragmentContainer, graphql} from 'react-relay'
import TaskColumns from 'universal/components/TaskColumns/TaskColumns'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import getTaskById from '../../../../utils/getTaskById'
import {TEAM_DASH} from 'universal/utils/constants'

const mapStateToProps = (state, props) => {
  const {
    atmosphere: {viewerId},
    teamId
  } = props
  const {teamMemberFilterId} = state.teamDashboard
  return {
    myTeamMemberId: toTeamMemberId(teamId, viewerId),
    teamMemberFilterId
  }
}

interface Props {
  myTeamMemberId: string
  teamId: string
  teamMemberFilterId: string
  viewer: TeamColumnsContainer_viewer
}

const TeamColumnsContainer = (props: Props) => {
  const {myTeamMemberId, teamMemberFilterId, viewer} = props
  const {team} = viewer
  const {contentFilter, tasks, teamMembers} = team!
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
  }, [teamMemberFilterId, tasks, contentFilter])

  return (
    <TaskColumns
      getTaskById={getTaskById(tasks as any)}
      myTeamMemberId={myTeamMemberId}
      tasks={filteredTasks}
      teamMemberFilterId={teamMemberFilterId}
      area={TEAM_DASH}
    />
  )
}

export default createFragmentContainer(
  withAtmosphere(connect(mapStateToProps)(TeamColumnsContainer)),
  graphql`
    fragment TeamColumnsContainer_viewer on User {
      team(teamId: $teamId) {
        contentFilter
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
)
