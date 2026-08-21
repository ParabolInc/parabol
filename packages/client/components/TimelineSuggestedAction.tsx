import graphql from 'babel-plugin-relay/macro'
import {lazy} from 'react'
import {useFragment} from 'react-relay'
import type {TimelineSuggestedAction_viewer$key} from '../__generated__/TimelineSuggestedAction_viewer.graphql'
import DelayUnmount from './DelayUnmount'

interface Props {
  viewer: TimelineSuggestedAction_viewer$key
}

const lookup = {
  SuggestedActionInviteYourTeam: lazy(
    () =>
      import(
        /* webpackChunkName: 'SuggestedActionInviteYourTeam' */ './SuggestedActionInviteYourTeam'
      )
  ),
  SuggestedActionTryTheDemo: lazy(
    () => import(/* webpackChunkName: 'SuggestedActionTryTheDemo' */ './SuggestedActionTryTheDemo')
  ),
  SuggestedActionTryRetroMeeting: lazy(
    () =>
      import(
        /* webpackChunkName: 'SuggestedActionTryRetroMeeting' */ './SuggestedActionTryRetroMeeting'
      )
  ),
  SuggestedActionTryActionMeeting: lazy(
    () =>
      import(
        /* webpackChunkName: 'SuggestedActionTryActionMeeting' */ './SuggestedActionTryActionMeeting'
      )
  ),
  SuggestedActionCreateNewTeam: lazy(
    () =>
      import(
        /* webpackChunkName: 'SuggestedActionCreateNewTeam' */ './SuggestedActionCreateNewTeam'
      )
  )
} as const

function TimelineSuggestedAction(props: Props) {
  const {viewer: viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment TimelineSuggestedAction_viewer on User {
        suggestedActions {
          ...TimelineSuggestedAction_suggestedAction @relay(mask: false)
        }
      }
    `,
    viewerRef
  )
  const {suggestedActions} = viewer
  const suggestedAction = suggestedActions?.[0]
  const renderAction = () => {
    if (!suggestedAction) return null
    const {
      SuggestedActionInviteYourTeam_suggestedAction: inviteYourTeam,
      SuggestedActionTryTheDemo_suggestedAction: tryTheDemo,
      SuggestedActionTryRetroMeeting_suggestedAction: tryRetroMeeting,
      SuggestedActionTryActionMeeting_suggestedAction: tryActionMeeting,
      SuggestedActionCreateNewTeam_suggestedAction: createNewTeam
    } = suggestedAction
    if (inviteYourTeam)
      return <lookup.SuggestedActionInviteYourTeam suggestedAction={inviteYourTeam} />
    if (tryTheDemo) return <lookup.SuggestedActionTryTheDemo suggestedAction={tryTheDemo} />
    if (tryRetroMeeting)
      return <lookup.SuggestedActionTryRetroMeeting suggestedAction={tryRetroMeeting} />
    if (tryActionMeeting)
      return <lookup.SuggestedActionTryActionMeeting suggestedAction={tryActionMeeting} />
    if (createNewTeam)
      return <lookup.SuggestedActionCreateNewTeam suggestedAction={createNewTeam} />
    return null
  }
  return (
    <div className='pb-4'>
      <DelayUnmount unmountAfter={500}>{renderAction()}</DelayUnmount>
    </div>
  )
}

// broken out so mutations can request all of these at once
graphql`
  fragment TimelineSuggestedAction_suggestedAction on SuggestedAction {
    __typename
    ...SuggestedActionInviteYourTeam_suggestedAction @alias
    ...SuggestedActionTryTheDemo_suggestedAction @alias
    ...SuggestedActionTryRetroMeeting_suggestedAction @alias
    ...SuggestedActionTryActionMeeting_suggestedAction @alias
    ...SuggestedActionCreateNewTeam_suggestedAction @alias
  }
`

export default TimelineSuggestedAction
