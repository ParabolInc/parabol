import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {lazy} from 'react'
import {useFragment} from 'react-relay'
import {TimelineSuggestedAction_viewer$key} from '../__generated__/TimelineSuggestedAction_viewer.graphql'
import {ValueOf} from '../types/generics'
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

const Wrapper = styled('div')({
  paddingBottom: 16
})

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
  let AsyncComponent: ValueOf<typeof lookup> | undefined
  if (suggestedAction) {
    const {__typename} = suggestedAction
    AsyncComponent = lookup[__typename as keyof typeof lookup]
  }
  return (
    <Wrapper>
      <DelayUnmount unmountAfter={500}>
        {AsyncComponent && suggestedAction ? (
          <AsyncComponent suggestedAction={suggestedAction} />
        ) : null}
      </DelayUnmount>
    </Wrapper>
  )
}

// broken out so mutations can request all of these at once
graphql`
  fragment TimelineSuggestedAction_suggestedAction on SuggestedAction {
    __typename
    ...SuggestedActionInviteYourTeam_suggestedAction
    ...SuggestedActionTryTheDemo_suggestedAction
    ...SuggestedActionTryRetroMeeting_suggestedAction
    ...SuggestedActionTryActionMeeting_suggestedAction
    ...SuggestedActionCreateNewTeam_suggestedAction
  }
`

export default TimelineSuggestedAction
