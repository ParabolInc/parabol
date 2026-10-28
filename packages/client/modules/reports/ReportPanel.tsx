import graphql from 'babel-plugin-relay/macro'
import {useId} from 'react'
import {useFragment} from 'react-relay'
import {Close} from '~/ui/icons'
import type {ReportPanel_organization$key} from '../../__generated__/ReportPanel_organization.graphql'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import {cn} from '../../ui/cn'
import ReportExportButton from './ReportExportButton'
import ReportPageResult from './ReportPageResult'
import ReportPinButton from './ReportPinButton'
import ReportSpecEditor from './ReportSpecEditor'
import type {ReportPagePeriod} from './reportPeriodParam'

interface Props {
  organizationRef: ReportPanel_organization$key | null | undefined
  orgId: string
  spec: ReportSpec
  name: string
  period: ReportPagePeriod
  reportQuestionId: string | null
  // the report's own page names it in its top heading
  isPageHeading?: boolean
  onSpecChange: (spec: ReportSpec) => void
  onClose?: () => void
}

const ReportPanel = (props: Props) => {
  const {organizationRef, orgId, spec, name, period, reportQuestionId, isPageHeading} = props
  const {onSpecChange, onClose} = props
  const organization = useFragment(
    graphql`
      fragment ReportPanel_organization on Organization {
        report(spec: $spec, timeZone: $timeZone) {
          step
          ...ReportExportButton_result
        }
        ...ReportPinButton_organization
        ...ReportSpecEditor_organization
        ...ReportPageResult_organization
      }
    `,
    organizationRef
  )
  const headingId = useId()
  const report = organization?.report
  const Heading = isPageHeading ? 'h1' : 'h2'
  return (
    <section
      aria-labelledby={headingId}
      className='rounded-md border border-hairline bg-surface-card shadow-xs'
    >
      <div className='flex flex-wrap items-start gap-x-3 gap-y-2 px-5 pt-4'>
        <Heading
          id={headingId}
          className={cn(
            'm-0 min-w-0 flex-[1_1_240px] self-center font-semibold',
            isPageHeading ? 'text-xl' : 'text-lg'
          )}
        >
          {name}
        </Heading>
        <div className='ml-auto flex items-center gap-2'>
          {organization && (
            <ReportPinButton
              organizationRef={organization}
              spec={spec}
              title={name}
              period={period}
              reportQuestionId={reportQuestionId}
            />
          )}
          {report && <ReportExportButton resultRef={report} spec={spec} title={name} />}
          {onClose && (
            <button
              type='button'
              aria-label={`Close ${name}`}
              onClick={onClose}
              className='flex size-9 cursor-pointer items-center justify-center rounded-md text-fg-secondary hover:bg-surface-hover'
            >
              <Close className='text-[20px]' />
            </button>
          )}
        </div>
      </div>
      <div className='px-5 pt-3 pb-4'>
        <ReportSpecEditor
          organizationRef={organization}
          spec={spec}
          step={report?.step}
          onChange={onSpecChange}
        />
      </div>
      <ReportPageResult organizationRef={organization} orgId={orgId} spec={spec} />
    </section>
  )
}

export default ReportPanel
