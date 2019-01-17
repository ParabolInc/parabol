import {TimelineSuggestedAction_viewer} from '__generated__/TimelineSuggestedAction_viewer.graphql'
import React, {lazy} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'

interface Props {
  viewer: TimelineSuggestedAction_viewer
}

const lookup = {
  SuggestedActionInviteYourTeam: lazy(() =>
    import(/* webpackChunkName: 'SuggestedActionInviteYourTeam' */ 'universal/components/SuggestedActionInviteYourTeam')
  ),
  SuggestedActionTryTheDemo: lazy(() =>
    import(/* webpackChunkName: 'SuggestedActionTryTheDemo' */ 'universal/components/SuggestedActionTryTheDemo')
  ),
  SuggestedActionTryRetroMeeting: lazy(() =>
    import(/* webpackChunkName: 'SuggestedActionTryRetroMeeting' */ 'universal/components/SuggestedActionTryRetroMeeting')
  ),
  SuggestedActionTryActionMeeting: lazy(() =>
    import(/* webpackChunkName: 'SuggestedActionTryActionMeeting' */ 'universal/components/SuggestedActionTryActionMeeting')
  )
}

const TimelineSuggestedAction = (props: Props) => {
  const {viewer} = props
  const {suggestedActions} = viewer
  const [suggestedAction] = suggestedActions
  if (!suggestedAction) return null
  const {__typename} = suggestedAction
  const AsyncComponent = lookup[__typename]
  if (!AsyncComponent) return null
  return <AsyncComponent suggestedAction={suggestedAction} />
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
