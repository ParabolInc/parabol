import React from 'react'
import {graphql} from 'react-relay'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import useAtmosphere from 'universal/hooks/useAtmosphere'
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
  closePortal: () => void
  task: any
}

const TaskFooterTeamAssigneeMenuRoot = (props: Props) => {
  const {closePortal, task} = props
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      render={renderQuery(TaskFooterTeamAssigneeMenu, {props: {closePortal, task}})}
    />
  )
}

export default TaskFooterTeamAssigneeMenuRoot
