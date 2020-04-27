import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {MenuProps} from '../../../hooks/useMenu'
import TaskFooterTeamAssigneeMenu from './OutcomeCardAssignMenu/TaskFooterTeamAssigneeMenu'
import renderQuery from '../../../utils/relay/renderQuery'
import {UseTaskChild} from '../../../hooks/useTaskChildFocus'
import {TaskFooterTeamAssigneeMenuRootQuery} from '~/__generated__/TaskFooterTeamAssigneeMenuRootQuery.graphql'

const query = graphql`
  query TaskFooterTeamAssigneeMenuRootQuery {
    viewer {
      ...TaskFooterTeamAssigneeMenu_viewer
    }
  }
`

interface Props {
  menuProps: MenuProps
  task: any
  useTaskChild: UseTaskChild
}

const TaskFooterTeamAssigneeMenuRoot = (props: Props) => {
  const {menuProps, task, useTaskChild} = props
  const atmosphere = useAtmosphere()
  useTaskChild('teamAssignee')
  return (
    <QueryRenderer<TaskFooterTeamAssigneeMenuRootQuery>
      environment={atmosphere}
      query={query}
      variables={{}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(TaskFooterTeamAssigneeMenu, {props: {menuProps, task}})}
    />
  )
}

export default TaskFooterTeamAssigneeMenuRoot
