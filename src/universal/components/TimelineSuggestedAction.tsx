import React, {lazy} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {TimelineSuggestedAction_viewer} from '__generated__/TimelineSuggestedAction_viewer.graphql'
// import SuggestedActionInviteYourTeam from './SuggestedActionInviteYourTeam'

interface Props {
  viewer: TimelineSuggestedAction_viewer
}

const lookup = {
  SuggestedActionInviteYourTeam: lazy(() =>
    import(/* webpackChunkName: 'SuggestedActionInviteYourTeam' */ 'universal/components/SuggestedActionInviteYourTeam')
  )
}

const TimelineSuggestedAction = (props: Props) => {
  const {viewer} = props
  const {suggestedAction} = viewer
  // const mockViewer = {suggestedAction: {team: {name: 'My Team'}}} || suggestedAction
  // return <SuggestedActionInviteYourTeam viewer={mockViewer} />
  if (!suggestedAction) return null
  const {__typename} = suggestedAction
  const AsyncComponent = lookup[__typename]
  if (!AsyncComponent) return null
  return <AsyncComponent viewer={viewer} />
}

export default createFragmentContainer(
  TimelineSuggestedAction,
  graphql`
    fragment TimelineSuggestedAction_viewer on User {
      ...SuggestedActionInviteYourTeam_viewer
      suggestedAction {
        __typename
      }
    }
  `
)
