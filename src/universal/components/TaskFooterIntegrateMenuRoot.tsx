import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import withAtmosphere, {WithAtmosphereProps} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {cacheConfig} from 'universal/utils/constants'
import renderQuery from '../utils/relay/renderQuery'
import TaskFooterIntegrateMenu from 'universal/components/TaskFooterIntegrateMenu'

const query = graphql`
  query TaskFooterIntegrateMenuRootQuery {
    viewer {
      ...TaskFooterIntegrateMenu_viewer
    }
  }
`

interface Props extends WithAtmosphereProps {
  task: TaskFooterIntegrateMenuRoot_task
}

const TaskFooterIntegrateMenuRoot = ({atmosphere, task}: Props) => {
  const {teamId} = task
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      variables={{teamId}}
      environment={atmosphere}
      query={query}
      render={renderQuery(TaskFooterIntegrateMenu)}
    />
  )
}

export default createFragmentContainer(
  withAtmosphere(TaskFooterIntegrateMenuRoot),
  graphql`
    fragment TaskFooterIntegrateMenuRoot_task on Task {
      teamId
    }
  `
)
