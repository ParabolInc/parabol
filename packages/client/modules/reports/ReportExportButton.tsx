import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {FileDownload} from '~/ui/icons'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import type {ReportExportButton_result$key} from '../../__generated__/ReportExportButton_result.graphql'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuItem} from '../../ui/Menu/MenuItem'
import {toReportCSV} from './reportCSV'
import {formatReportBreakdown} from './reportSpecLabels'

interface Props {
  resultRef: ReportExportButton_result$key
  spec: ReportSpec
  title: string
}

const ReportExportButton = ({resultRef, spec, title}: Props) => {
  const {step, breakdown, rows} = useFragment(
    graphql`
      fragment ReportExportButton_result on ReportResult {
        step
        breakdown {
          dimension
          levelName
        }
        rows {
          keys {
            value
            label
            isPartial
          }
          values
          previousValues
        }
      }
    `,
    resultRef
  )
  const downloadCSV = () => {
    const breakdownNames = breakdown.map((item) => formatReportBreakdown(item, step))
    const csv = toReportCSV(spec, breakdownNames, step, rows)
    // the byte order mark tells spreadsheets the file is UTF-8
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], {type: 'text/csv;charset=utf-8'}))
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'Report'}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className='inline-flex'>
          <Menu
            trigger={
              <button
                type='button'
                aria-label='Export'
                className='flex size-9 cursor-pointer items-center justify-center rounded-md border border-hairline-strong text-fg-secondary hover:bg-surface-hover data-[state=open]:bg-surface-hover'
              >
                <FileDownload className='text-[20px]' />
              </button>
            }
          >
            <MenuContent align='end' sideOffset={4}>
              <MenuItem onSelect={downloadCSV}>Download CSV</MenuItem>
            </MenuContent>
          </Menu>
        </span>
      </TooltipTrigger>
      <TooltipContent side='bottom'>Export</TooltipContent>
    </Tooltip>
  )
}

export default ReportExportButton
