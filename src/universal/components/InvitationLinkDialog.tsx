import React, {useEffect} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import {WithAtmosphereProps} from 'universal/decorators/withAtmosphere/withAtmosphere'
import withAtmosphere from '../decorators/withAtmosphere/withAtmosphere'
import TeamInvitationAccept from './TeamInvitationAccept'
import TeamInvitationErrorNotFound from './TeamInvitationErrorNotFound'
import {InvitationLinkDialog_massInvitation} from '__generated__/InvitationLinkDialog_massInvitation.graphql'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useRouter from 'universal/hooks/useRouter'
import InvitationLinkErrorExpired from './InvitationLinkErrorExpired'
import InvitationLinkAuthentication from 'universal/components/InvitationLinkAuthentication'

interface Props extends WithAtmosphereProps, RouteComponentProps<{token: string}> {
  massInvitation: InvitationLinkDialog_massInvitation
}

const InvitationLinkDialog = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {match} = useRouter<{token: string}>()
  const {params} = match
  const {token} = params
  useEffect(() => {
    window.localStorage.setItem('massInvitationToken', token)
  }, [])
  const {massInvitation} = props
  const {errorType, teamId, teamName} = massInvitation
  switch (errorType) {
    case 'notFound':
      return <TeamInvitationErrorNotFound />
    case 'expired':
      return <InvitationLinkErrorExpired massInvitation={massInvitation} />
  }
  const {authToken} = atmosphere
  if (authToken) {
    return <TeamInvitationAccept invitationToken={token} teamId={teamId!} />
  }
  return <InvitationLinkAuthentication teamName={teamName!} invitationToken={token} />
}

export default createFragmentContainer(
  withAtmosphere(withRouter(InvitationLinkDialog)),
  graphql`
    fragment InvitationLinkDialog_massInvitation on MassInvitationPayload {
      ...InvitationLinkErrorExpired_massInvitation
      errorType
      inviterName
      meetingType
      teamName
      teamId
    }
  `
)
