import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {MenuProps} from 'universal/hooks/useMenu'
import TaskFooterUserAssigneeMenu from 'universal/modules/outcomeCard/components/OutcomeCardAssignMenu/TaskFooterUserAssigneeMenu'
import {cacheConfig} from 'universal/utils/constants'
import renderQuery from '../../../utils/relay/renderQuery'
import {TaskFooterUserAssigneeMenuRoot_task} from '__generated__/TaskFooterUserAssigneeMenuRoot_task.graphql'

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
}

const TaskFooterUserAssigneeMenuRoot = (props: Props) => {
  const {area, menuProps, task} = props
  const {team} = task
  const {id: teamId} = team
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
