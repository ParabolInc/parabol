import ReportInvitePromptRoot from './ReportInvitePromptRoot'
import ReportLineView from './ReportLineView'
import ReportSampleBehind from './ReportSampleBehind'
import {SAMPLE_ACTIVE_USERS_ROWS, SAMPLE_ACTIVE_USERS_SPEC} from './reportActiveUsersSample'

interface Props {
  orgId: string
  isCompact?: boolean
}

// While the viewer is the only one using Parabol, a sample of a growing organization shows what the report will look
// like behind the prompt to invite their team
const ReportActiveUsersEmpty = ({orgId, isCompact = false}: Props) => (
  <ReportSampleBehind
    isCompact={isCompact}
    sample={
      <ReportLineView
        spec={SAMPLE_ACTIVE_USERS_SPEC}
        step='WEEK'
        rows={SAMPLE_ACTIVE_USERS_ROWS}
        isCompact={isCompact}
      />
    }
  >
    <ReportInvitePromptRoot
      orgId={orgId}
      title='Invite your team'
      description={
        isCompact
          ? 'Invite teammates to see how many people use Parabol.'
          : 'Invite your teammates, and this chart shows how many people use Parabol as your organization grows. The people behind this are a sample.'
      }
      isCompact={isCompact}
    />
  </ReportSampleBehind>
)

export default ReportActiveUsersEmpty
