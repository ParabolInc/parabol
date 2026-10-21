import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ExpandMore, FileDownload} from '~/ui/icons'
import type {ReportExportButton_result$key} from '../../__generated__/ReportExportButton_result.graphql'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuItem} from '../../ui/Menu/MenuItem'
import {toReportCSV} from './reportCSV'

interface Props {
  resultRef: ReportExportButton_result$key
  spec: ReportSpec
  title: string
}

const ReportExportButton = ({resultRef, spec, title}: Props) => {
  const {step, rows} = useFragment(
    graphql`
      fragment ReportExportButton_result on ReportResult {
        step
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
    const csv = toReportCSV(spec, step, rows)
    // the byte order mark tells spreadsheets the file is UTF-8
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], {type: 'text/csv;charset=utf-8'}))
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'Report'}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <Menu
      trigger={
        <button
          type='button'
          className='inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-hairline-strong pr-1.5 pl-2.5 font-semibold text-fg-primary text-sm hover:bg-surface-hover data-[state=open]:bg-surface-hover'
        >
          <FileDownload className='text-[18px] text-fg-secondary' />
          Export
          <ExpandMore className='text-[20px] text-fg-secondary' />
        </button>
      }
    >
      <MenuContent align='end' sideOffset={4}>
        <MenuItem onSelect={downloadCSV}>Download CSV</MenuItem>
      </MenuContent>
    </Menu>
  )
}

export default ReportExportButton
