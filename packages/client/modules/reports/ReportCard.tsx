import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import type {ReportCard_pin$key} from '../../__generated__/ReportCard_pin.graphql'
import ReportView from './ReportView'
import {toReportPagePath} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'
import {REPORT_PERIOD_LABELS} from './reportSpecLabels'
import {parseReportSpecJSON} from './reportSpecParam'

interface Props {
  pinRef: ReportCard_pin$key
  orgId: string
  period: ReportPagePeriod
}

const ReportCard = ({pinRef, orgId, period}: Props) => {
  const pin = useFragment(
    graphql`
      fragment ReportCard_pin on ReportPin {
        title
        description
        spec
        report(timeZone: $timeZone, pagePeriod: $pagePeriod) {
          ...ReportView_result
        }
      }
    `,
    pinRef
  )
  const {title, description, report} = pin
  const spec = useMemo(() => parseReportSpecJSON(pin.spec), [pin.spec])
  const ownPeriod = spec?.period.preset && spec.period.preset !== 'PAGE' ? spec.period.preset : null
  return (
    <article className='flex min-w-0 flex-col gap-3 rounded-md border border-hairline bg-surface-card py-4 pr-3 pl-5 shadow-xs'>
      <div className='flex flex-col'>
        <h3 className='m-0 font-semibold text-base'>{title}</h3>
        <span className='text-fg-muted text-xs'>
          Built in · {description}
          {ownPeriod && ` · ${REPORT_PERIOD_LABELS[ownPeriod]}, whatever the page’s period`}
        </span>
      </div>
      <div className='pr-2'>
        {spec ? (
          <ReportView spec={spec} resultRef={report} isCompact />
        ) : (
          <p className='m-0 text-fg-muted text-sm'>This report can’t be shown</p>
        )}
      </div>
      {spec && (
        <Link
          to={toReportPagePath(orgId, spec, title, period)}
          className='mt-auto self-start font-semibold text-[13px] text-sky-600 hover:underline dark:text-accent'
        >
          Open report
        </Link>
      )}
    </article>
  )
}

export default ReportCard
