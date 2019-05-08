import {TeamColumnsContainer_viewer} from '__generated__/TeamColumnsContainer_viewer.graphql'
import React, {useEffect, useState} from 'react'
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
  const [filteredTasks, setFilteredTasks] = useState(tasks)
  useEffect(() => {
    const contentFilterRegex = new RegExp(contentFilter!, 'i')
    const contentFilteredEdges = contentFilter
      ? tasks.edges.filter(({node}) => {
        const {contentText} = node
        return contentText && node.contentText!.match(contentFilterRegex)
      })
      : tasks.edges

    const teamMemberFilteredEdges = teamMemberFilterId
      ? contentFilteredEdges.filter(({node}) => node.assignee.id === teamMemberFilterId)
      : contentFilteredEdges

    const edgesWithTeamMembers = teamMemberFilteredEdges.map((edge) => {
      return {
        ...edge,
        node: {
          ...edge.node,
          teamMembers
        }
      }
    })
    setFilteredTasks({
      ...tasks,
      edges: edgesWithTeamMembers
    })
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
              # grab these so we can sort correctly
              id
              content @__clientField(handle: "contentText")
              contentText
              status
              sortOrder
              assignee {
                id
              }
              ...DraggableTask_task
            }
          }
        }
      }
    }
  `
)
