import {Suspense, useState} from 'react'
import orgInviteeFieldQuery, {
  type OrgInviteeFieldQuery
} from '../../__generated__/OrgInviteeFieldQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import getInviteeMeetingsWindow from '../../utils/getInviteeMeetingsWindow'
import InviteeField, {type InviteeFieldProps} from './InviteeField'
import OrgInviteeField from './OrgInviteeField'

type Props = Omit<InviteeFieldProps, 'directory'> & {orgId: string}

const OrgInviteeFieldRoot = (props: Props) => {
  const {orgId, ...fieldProps} = props
  const [meetingsWindow] = useState(getInviteeMeetingsWindow)
  const queryRef = useQueryLoaderNow<OrgInviteeFieldQuery>(orgInviteeFieldQuery, {
    orgId,
    ...meetingsWindow
  })
  const emailOnlyField = <InviteeField {...fieldProps} directory={null} />
  return (
    <Suspense fallback={emailOnlyField}>
      {queryRef ? <OrgInviteeField {...fieldProps} queryRef={queryRef} /> : emailOnlyField}
    </Suspense>
  )
}

export default OrgInviteeFieldRoot
