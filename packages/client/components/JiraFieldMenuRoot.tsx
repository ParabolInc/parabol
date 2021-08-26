import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer, QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import {JiraFieldMenuRoot_stage} from '../__generated__/JiraFieldMenuRoot_stage.graphql'
import JiraFieldMenu from './JiraFieldMenu'

const query = graphql`
  query JiraFieldMenuRootQuery($teamId: ID!, $cloudId: ID!) {
    viewer {
      ...JiraFieldMenu_viewer
    }
  }
`

interface Props {
  menuProps: MenuProps
  stage: JiraFieldMenuRoot_stage
}

const JiraFieldMenuRoot = (props: Props) => {
  const {menuProps, stage} = props
  const atmosphere = useAtmosphere()
  const {task, teamId} = stage
  if (!task) return null
  const {integration} = task
  if (integration?.__typename !== 'JiraIssue') return null
  const {cloudId} = integration
  return (
    <QueryRenderer
      variables={{cloudId, teamId}}
      environment={atmosphere}
      query={query}
      fetchPolicy={'store-or-network' as any}
      render={({props, error}) => {
        const viewer = (props as any)?.viewer ?? null
        return <JiraFieldMenu viewer={viewer} error={error} menuProps={menuProps} stage={stage} />
      }}
    />
  )
}

export default createFragmentContainer(JiraFieldMenuRoot, {
  stage: graphql`
    fragment JiraFieldMenuRoot_stage on EstimateStage {
      teamId
      task {
        integration {
          ... on JiraIssue {
            __typename
            cloudId
          }
        }
      }
      ...JiraFieldMenu_stage
    }
  `
})
