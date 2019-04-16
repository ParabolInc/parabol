import {TaskFooterIntegrateMenuRoot_task} from '__generated__/TaskFooterIntegrateMenuRoot_task.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import TaskFooterIntegrateMenu from 'universal/components/TaskFooterIntegrateMenu'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {cacheConfig} from 'universal/utils/constants'
import {MenuMutationProps} from 'universal/utils/relay/withMutationProps'
import renderQuery from '../utils/relay/renderQuery'

const query = graphql`
  query TaskFooterIntegrateMenuRootQuery($teamId: ID!) {
    viewer {
      ...TaskFooterIntegrateMenu_viewer
    }
  }
`

interface Props {
  closePortal: () => void
  mutationProps: MenuMutationProps
  task: TaskFooterIntegrateMenuRoot_task
}

const TaskFooterIntegrateMenuRoot = ({closePortal, mutationProps, task}: Props) => {
  const {teamId} = task
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      variables={{teamId}}
      environment={atmosphere}
      query={query}
      render={renderQuery(TaskFooterIntegrateMenu, {props: {closePortal, mutationProps, task}})}
    />
  )
}

export default createFragmentContainer(
  TaskFooterIntegrateMenuRoot,
  graphql`
    fragment TaskFooterIntegrateMenuRoot_task on Task {
      teamId
      ...TaskFooterIntegrateMenu_task
    }
  `
)
