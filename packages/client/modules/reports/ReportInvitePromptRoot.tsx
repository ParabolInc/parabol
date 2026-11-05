import {Suspense} from 'react'
import reportInvitePromptQuery, {
  type ReportInvitePromptQuery
} from '../../__generated__/ReportInvitePromptQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import ReportEmptyPrompt from './ReportEmptyPrompt'
import ReportInvitePrompt from './ReportInvitePrompt'

interface Props {
  orgId: string
  title: string
  description: string
  isCompact: boolean
}

const INVITE_LABEL = 'Invite teammates'

const ReportInvitePromptRoot = ({orgId, title, description, isCompact}: Props) => {
  const queryRef = useQueryLoaderNow<ReportInvitePromptQuery>(reportInvitePromptQuery, {orgId})
  const loading = (
    <ReportEmptyPrompt
      title={title}
      description={description}
      actionLabel={INVITE_LABEL}
      action={null}
      isCompact={isCompact}
    />
  )
  return (
    <Suspense fallback={loading}>
      {queryRef ? (
        <ReportInvitePrompt
          queryRef={queryRef}
          orgId={orgId}
          title={title}
          description={description}
          inviteLabel={INVITE_LABEL}
          isCompact={isCompact}
        />
      ) : (
        loading
      )}
    </Suspense>
  )
}

export default ReportInvitePromptRoot
