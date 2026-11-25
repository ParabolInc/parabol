import {Suspense} from 'react'
import teamInviteeFieldQuery, {
  type TeamInviteeFieldQuery
} from '../../__generated__/TeamInviteeFieldQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import InviteeField, {type InviteeFieldProps} from './InviteeField'
import TeamInviteeField from './TeamInviteeField'

type Props = Omit<InviteeFieldProps, 'directory' | 'targetTeamId'> & {teamId: string}

const TeamInviteeFieldRoot = (props: Props) => {
  const {teamId, ...restProps} = props
  const fieldProps = {...restProps, targetTeamId: teamId}
  const queryRef = useQueryLoaderNow<TeamInviteeFieldQuery>(teamInviteeFieldQuery, {teamId})
  const emailOnlyField = <InviteeField {...fieldProps} directory={null} />
  return (
    <Suspense fallback={emailOnlyField}>
      {queryRef ? <TeamInviteeField {...fieldProps} queryRef={queryRef} /> : emailOnlyField}
    </Suspense>
  )
}

export default TeamInviteeFieldRoot
