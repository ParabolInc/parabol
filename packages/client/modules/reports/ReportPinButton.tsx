import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Bookmark, BookmarkBorder} from '~/ui/icons'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import type {ReportPinButton_organization$key} from '../../__generated__/ReportPinButton_organization.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import usePinReportMutation from '../../mutations/usePinReportMutation'
import useUnpinReportMutation from '../../mutations/useUnpinReportMutation'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import {cn} from '../../ui/cn'
import {parseReportSpecJSON} from './reportSpecParam'

interface Props {
  organizationRef: ReportPinButton_organization$key
  spec: ReportSpec
  title: string
  reportQuestionId: string | null
}

const ReportPinButton = ({organizationRef, spec, title, reportQuestionId}: Props) => {
  const {
    id: orgId,
    isBillingLeader,
    reportPins
  } = useFragment(
    graphql`
      fragment ReportPinButton_organization on Organization {
        id
        isBillingLeader
        reportPins {
          id
          spec
        }
      }
    `,
    organizationRef
  )
  const atmosphere = useAtmosphere()
  const [pin, isPinning] = usePinReportMutation()
  const [unpin, isUnpinning] = useUnpinReportMutation()
  const specJSON = JSON.stringify(spec)
  const pinned = reportPins.find(
    (reportPin) => JSON.stringify(parseReportSpecJSON(reportPin.spec)) === specJSON
  )
  const showError = (message: string) => {
    atmosphere.eventEmitter.emit('addSnackbar', {key: 'reportPinError', message, autoDismiss: 5})
  }
  const onClick = () => {
    if (!isBillingLeader || isPinning || isUnpinning) return
    const callbacks = {
      onCompleted: (_response: unknown, errors?: readonly {message: string}[] | null) => {
        if (errors?.[0]) showError(errors[0].message)
      },
      onError: (error: Error) => showError(error.message)
    }
    if (pinned) {
      unpin({variables: {orgId, pinId: pinned.id}, ...callbacks})
    } else {
      pin({variables: {orgId, spec, title, reportQuestionId}, ...callbacks})
    }
  }
  const Icon = pinned ? Bookmark : BookmarkBorder
  const action = pinned ? 'unpin' : 'pin'
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          aria-pressed={!!pinned}
          aria-disabled={!isBillingLeader || undefined}
          onClick={onClick}
          className={cn(
            'inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-hairline-strong pr-3 pl-2 font-semibold text-fg-primary text-sm hover:bg-surface-hover',
            !isBillingLeader && 'cursor-default opacity-50 hover:bg-transparent'
          )}
        >
          <Icon className={cn('text-[18px]', pinned ? 'text-grape-500' : 'text-fg-secondary')} />
          {pinned ? 'Pinned' : 'Pin'}
        </button>
      </TooltipTrigger>
      <TooltipContent side='bottom'>
        {!isBillingLeader
          ? `Only org admins and billing leaders can ${action} reports`
          : pinned
            ? 'Unpin it from the Reports page'
            : 'Pin it to the Reports page for everyone who can see Reports'}
      </TooltipContent>
    </Tooltip>
  )
}

export default ReportPinButton
