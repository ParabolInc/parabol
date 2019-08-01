import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import QueryRenderer from '../../../components/QueryRenderer/QueryRenderer'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {MenuProps} from '../../../hooks/useMenu'
import TaskFooterTeamAssigneeMenu from './OutcomeCardAssignMenu/TaskFooterTeamAssigneeMenu'
import {cacheConfig} from '../../../utils/constants'
import renderQuery from '../../../utils/relay/renderQuery'

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
}

const TaskFooterTeamAssigneeMenuRoot = (props: Props) => {
  const {menuProps, task} = props
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      render={renderQuery(TaskFooterTeamAssigneeMenu, {props: {menuProps, task}})}
    />
  )
}

export default TaskFooterTeamAssigneeMenuRoot
