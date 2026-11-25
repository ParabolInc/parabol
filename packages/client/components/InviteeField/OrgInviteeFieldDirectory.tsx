import type {useInviteeDirectory_organization$key} from '../../__generated__/useInviteeDirectory_organization.graphql'
import type {useInviteeDirectory_viewer$key} from '../../__generated__/useInviteeDirectory_viewer.graphql'
import useInviteeDirectory from '../../hooks/useInviteeDirectory'
import InviteeField, {type InviteeFieldProps} from './InviteeField'

type Props = Omit<InviteeFieldProps, 'directory'> & {
  viewerRef: useInviteeDirectory_viewer$key
  organizationRef: useInviteeDirectory_organization$key
}

const OrgInviteeFieldDirectory = (props: Props) => {
  const {viewerRef, organizationRef, ...fieldProps} = props
  const directory = useInviteeDirectory(viewerRef, organizationRef)
  return <InviteeField {...fieldProps} directory={directory} />
}

export default OrgInviteeFieldDirectory
