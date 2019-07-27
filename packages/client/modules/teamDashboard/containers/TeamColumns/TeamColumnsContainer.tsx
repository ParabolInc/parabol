import {TeamColumnsContainer_viewer} from '../../../../__generated__/TeamColumnsContainer_viewer.graphql'
import React, {useMemo} from 'react'
import {connect} from 'react-redux'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import TaskColumns from '../../../../components/TaskColumns/TaskColumns'
import withAtmosphere from '../../../../decorators/withAtmosphere/withAtmosphere'
import toTeamMemberId from '../../../../utils/relay/toTeamMemberId'
import getTaskById from '../../../../utils/getTaskById'
import {AreaEnum} from '../../../../types/graphql'

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
      getTaskById={getTaskById(filteredTasks)}
      myTeamMemberId={myTeamMemberId}
      tasks={filteredTasks}
      teamMemberFilterId={teamMemberFilterId}
      area={AreaEnum.teamDash}
    />
  )
}

export default createFragmentContainer(
  withAtmosphere(connect(mapStateToProps)(TeamColumnsContainer)),
  {
    viewer: graphql`
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
  }
)
