import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import TaskColumns from '../../../../components/TaskColumns/TaskColumns'
import {UserColumnsContainer_viewer} from '../../../../__generated__/UserColumnsContainer_viewer.graphql'
import {AreaEnum} from '../../../../types/graphql'

interface Props {
  viewer: UserColumnsContainer_viewer
}

const UserColumnsContainer = (props: Props) => {
  const {viewer} = props
  const {contentFilter, tasks, teamFilter} = viewer
  const teamFilterId = (teamFilter && teamFilter.id) || null
  const filteredTasks = useMemo(() => {
    const contentFilterRegex = new RegExp(contentFilter!, 'i')
    const nodes = tasks.edges.map(({node}) => node)
    const contentFilteredNodes = contentFilter
      ? nodes.filter((task) => {
          return task.contentText && task.contentText.match(contentFilterRegex)
        })
      : nodes

    const teamFilteredNodes = teamFilterId
      ? contentFilteredNodes.filter((node) => node.team.id === teamFilterId)
      : contentFilteredNodes

    return teamFilteredNodes.map((node) => ({
      ...node
    }))
  }, [teamFilterId, tasks, contentFilter])
  {
    const {
      viewer: {teams}
    } = props

    return <TaskColumns area={AreaEnum.userDash} tasks={filteredTasks} teams={teams} />
  }
}

export default createFragmentContainer(UserColumnsContainer, {
  viewer: graphql`
    fragment UserColumnsContainer_viewer on User {
      teamFilter {
        id
      }
      teams {
        id
        name
        meetingId
      }
      contentFilter
      tasks(first: 1000) @connection(key: "UserColumnsContainer_tasks") {
        edges {
          node {
            ...TaskColumns_tasks
            # grab these so we can sort correctly
            id
            content @__clientField(handle: "contentText")
            contentText
            status
            sortOrder
            team {
              id
            }
          }
        }
      }
    }
  `
})
