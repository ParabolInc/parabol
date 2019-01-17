import {TimelineSuggestedAction_viewer} from '__generated__/TimelineSuggestedAction_viewer.graphql'
import React, {lazy} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import DelayUnmount from 'universal/components/DelayUnmount'

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
  ),
  SuggestedActionCreateNewTeam: lazy(() =>
    import(/* webpackChunkName: 'SuggestedActionCreateNewTeam' */ 'universal/components/SuggestedActionCreateNewTeam')
  )
}

function TimelineSuggestedAction (props: Props) {
  const {viewer} = props
  const {suggestedActions} = viewer
  const [suggestedAction] = suggestedActions
  let AsyncComponent
  if (suggestedAction) {
    const {__typename} = suggestedAction
    AsyncComponent = lookup[__typename]
  }
  return (
    <DelayUnmount unmountAfter={500}>
      {AsyncComponent ? <AsyncComponent suggestedAction={suggestedAction} /> : null}
    </DelayUnmount>
  )
}

export default createFragmentContainer(
  TimelineSuggestedAction,
  graphql`
    fragment TimelineSuggestedAction_viewer on User {
      suggestedActions {
        ...SuggestedActionInviteYourTeam_suggestedAction
        ...SuggestedActionTryTheDemo_suggestedAction
        ...SuggestedActionTryRetroMeeting_suggestedAction
        ...SuggestedActionTryActionMeeting_suggestedAction
        ...SuggestedActionCreateNewTeam_suggestedAction
        __typename
      }
    }
  `
)
