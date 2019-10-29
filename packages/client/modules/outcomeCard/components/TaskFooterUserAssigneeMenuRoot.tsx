import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {MenuProps} from '../../../hooks/useMenu'
import TaskFooterUserAssigneeMenu from './OutcomeCardAssignMenu/TaskFooterUserAssigneeMenu'
import {cacheConfig} from '../../../utils/constants'
import renderQuery from '../../../utils/relay/renderQuery'
import {TaskFooterUserAssigneeMenuRoot_task} from '../../../__generated__/TaskFooterUserAssigneeMenuRoot_task.graphql'
import {UseTaskChild} from '../../../hooks/useTaskChildFocus'

const query = graphql`
  query TaskFooterUserAssigneeMenuRootQuery($teamId: ID!) {
    viewer {
      ...TaskFooterUserAssigneeMenu_viewer
    }
  }
`

interface Props {
  area: string
  menuProps: MenuProps
  task: TaskFooterUserAssigneeMenuRoot_task
  useTaskChild: UseTaskChild
}

const TaskFooterUserAssigneeMenuRoot = (props: Props) => {
  const {area, menuProps, task, useTaskChild} = props
  const {team} = task
  const {id: teamId} = team
  useTaskChild('userAssignee')
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      variables={{teamId}}
      query={query}
      render={renderQuery(TaskFooterUserAssigneeMenu, {props: {area, menuProps, task}})}
    />
  )
}

export default createFragmentContainer(TaskFooterUserAssigneeMenuRoot, {
  task: graphql`
    fragment TaskFooterUserAssigneeMenuRoot_task on Task {
      ...TaskFooterUserAssigneeMenu_task
      team {
        id
      }
    }
  `
})
