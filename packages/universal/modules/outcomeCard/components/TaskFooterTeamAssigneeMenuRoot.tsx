import React from 'react'
import {graphql} from 'react-relay'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {MenuProps} from 'universal/hooks/useMenu'
import TaskFooterTeamAssigneeMenu from 'universal/modules/outcomeCard/components/OutcomeCardAssignMenu/TaskFooterTeamAssigneeMenu'
import {cacheConfig} from 'universal/utils/constants'
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
