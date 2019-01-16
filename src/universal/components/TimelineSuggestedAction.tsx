import React, {lazy} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {TimelineSuggestedAction_viewer} from '__generated__/TimelineSuggestedAction_viewer.graphql'
import SuggestedActionTryTheDemo from './SuggestedActionTryTheDemo'

interface Props {
  viewer: TimelineSuggestedAction_viewer
}

const lookup = {
  SuggestedActionInviteYourTeam: lazy(() =>
    import(/* webpackChunkName: 'SuggestedActionInviteYourTeam' */ 'universal/components/SuggestedActionInviteYourTeam')
  ),
  SuggestedActionTryTheDemo: lazy(() =>
    import(/* webpackChunkName: 'SuggestedActionTryTheDemo' */ 'universal/components/SuggestedActionTryTheDemo')
  )
}

const TimelineSuggestedAction = (props: Props) => {
  const {viewer} = props
  const {suggestedActions} = viewer
  const [suggestedAction] = suggestedActions
  const mockSuggestedAction = {team: {name: 'My Team', teamMembers: []}} || suggestedAction
  return <SuggestedActionTryTheDemo suggestedAction={mockSuggestedAction} />
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
      suggestedActions {
        ...SuggestedActionInviteYourTeam_suggestedAction
        __typename
      }
    }
  `
)
