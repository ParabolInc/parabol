import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {Providers} from '../types/constEnums'
import {ScopePhaseAreaGitHub_meeting} from '../__generated__/ScopePhaseAreaGitHub_meeting.graphql'
import ScopePhaseAreaAddGitHub from './ScopePhaseAreaAddGitHub'
import ScopePhaseAreaGitHubScoping from './ScopePhaseAreaGitHubScoping'

const ComingSoon = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%'
})

interface Props {
  isActive: boolean
  gotoParabol: () => void
  meeting: ScopePhaseAreaGitHub_meeting
}

// poor man's feature flag. change this so we don't have to comment out stuff
const IS_DEV = false

const ScopePhaseAreaGitHub = (props: Props) => {
  const {isActive, gotoParabol, meeting} = props
  const {viewerMeetingMember} = meeting
  if (!viewerMeetingMember || !isActive) return null
  const {teamMember} = viewerMeetingMember
  const {integrations} = teamMember
  const hasAuth = integrations?.github?.scope === Providers.GITHUB_SCOPE
  if (IS_DEV) {
    if (!hasAuth) return <ScopePhaseAreaAddGitHub gotoParabol={gotoParabol} meeting={meeting} />
    return <ScopePhaseAreaGitHubScoping meeting={meeting} />
  } else {
    return <ComingSoon>Coming Soon!</ComingSoon>
  }
}

export default createFragmentContainer(ScopePhaseAreaGitHub, {
  meeting: graphql`
    fragment ScopePhaseAreaGitHub_meeting on PokerMeeting {
      ...ScopePhaseAreaAddGitHub_meeting
      ...ScopePhaseAreaGitHubScoping_meeting
      viewerMeetingMember {
        teamMember {
          integrations {
            github {
              isActive
              scope
            }
          }
        }
      }
    }
  `
})
