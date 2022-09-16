import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {lazy} from 'react'
import {createFragmentContainer} from 'react-relay'
import {TimelineSuggestedAction_viewer} from '../__generated__/TimelineSuggestedAction_viewer.graphql'
import DelayUnmount from './DelayUnmount'

interface Props {
  viewer: TimelineSuggestedAction_viewer
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
}

const Wrapper = styled('div')({
  paddingBottom: 16
})

function TimelineSuggestedAction(props: Props) {
  const {viewer} = props
  const {suggestedActions} = viewer
  const [suggestedAction] = suggestedActions
  let AsyncComponent
  if (suggestedAction) {
    const {__typename} = suggestedAction
    AsyncComponent = lookup[__typename]
  }
  return (
    <Wrapper>
      <DelayUnmount unmountAfter={500}>
        {AsyncComponent ? <AsyncComponent suggestedAction={suggestedAction} /> : null}
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

export default createFragmentContainer(TimelineSuggestedAction, {
  viewer: graphql`
    fragment TimelineSuggestedAction_viewer on User {
      suggestedActions {
        ...TimelineSuggestedAction_suggestedAction @relay(mask: false)
      }
    }
  `
})
