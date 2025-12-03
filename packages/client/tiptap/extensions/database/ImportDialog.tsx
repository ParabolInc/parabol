import {useMemo, useState} from 'react'
import * as Y from 'yjs'
import FlatPrimaryButton from '../../../components/FlatPrimaryButton'
import SecondaryButton from '../../../components/SecondaryButton'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {Checkbox} from '../../../ui/Checkbox/Checkbox'
import {cn} from '../../../ui/cn'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'
import plural from '../../../utils/plural'
import {appendColumn, appendRow, getColumnMeta, getColumns, getData, getRows} from './data'
import {useYArray, useYMap} from './hooks'
import {UploadCSV} from './UploadCSV'

const HEADER_MISMATCH = 'CSV headers do not match current table columns'

const clearAllData = (doc: Y.Doc) => {
  const columns = getColumns(doc)
  const rows = getRows(doc)
  const columnMeta = getColumnMeta(doc)
  const data = getData(doc)

  doc.transact(() => {
    columns.delete(0, columns.length)
    rows.delete(0, rows.length)
    columnMeta.clear()
    data.clear()
  })
}

const importRecords = (doc: Y.Doc, viewerId: string, records: string[][]) => {
  const first = records[0]
  if (!first) return

  const columns = getColumns(doc).toArray()

  if (columns.length < first.length) {
    throw new Error(HEADER_MISMATCH)
  }

  records.forEach((record) => {
    const mappedRecord = Object.fromEntries(record.map((value, index) => [columns[index], value]))
    appendRow(doc, viewerId, mappedRecord)
  })
}

type Props = {
  isOpen: boolean
  onClose: () => void
  doc: Y.Doc
}

export const ImportDialog = (props: Props) => {
  const {isOpen, onClose, doc} = props
  const {viewerId} = useAtmosphere()

  const [error, setError] = useState<Error | null>(null)
  const [records, setRecords] = useState<string[][]>()

  const [firstRowIsHeader, setFirstRowIsHeader] = useState(true)
  const [discardExistingData, setDiscardExistingData] = useState(false)
  const firstRowOffset = firstRowIsHeader ? 1 : 0

  const columns = useYArray(getColumns(doc))
  const columnMeta = useYMap(getColumnMeta(doc))
  const rows = useYArray(getRows(doc))

  const headers = useMemo(() => {
    if (!records || records.length === 0) return []

    const newHeaders = firstRowIsHeader
      ? records[0]!
      : records[0]!.map((_, index) => `Column ${index + 1}`)
    if (discardExistingData) {
      return newHeaders
    }
    return newHeaders.map((name, index) => {
      const id = columns[index]
      if (!id) return name
      const meta = columnMeta.get(id)
      return meta ? meta.name : `Column ${index + 1}`
    })
  }, [columns, columnMeta, firstRowIsHeader, discardExistingData, records])

  const resetState = () => {
    setRecords(undefined)
    setError(null)
    setFirstRowIsHeader(true)
    setDiscardExistingData(false)
  }

  const onImport = () => {
    if (!records) return
    if (discardExistingData) {
      clearAllData(doc)
    }

    const newHeaders = firstRowIsHeader
      ? records[0]!
      : records[0]!.map((_, index) => `Column ${index + 1}`)
    const columns = getColumns(doc)
    newHeaders.slice(columns.length).forEach((name) => {
      appendColumn(doc, {name, type: 'text'})
    })

    importRecords(doc, viewerId, records.slice(firstRowOffset))
    resetState()
    onClose()
  }

  const onBack = () => {
    resetState()
  }

  const onCancel = () => {
    resetState()
    onClose()
  }

  const recordCount = records ? records.length - firstRowOffset : 0
  const previewLength = records ? Math.min(3, recordCount) : 0

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='z-10 lg:w-4xl lg:max-w-4xl xl:w-5xl xl:max-w-5xl'>
        <DialogTitle className='mb-4'>Import CSV</DialogTitle>
        {!records ? (
          <UploadCSV onRecordsParsed={setRecords} onError={setError} />
        ) : (
          <div className='mb-3 text-left font-semibold text-slate-600 text-sm'>
            Import settings
            <div
              className='flex cursor-pointer flex-row gap-2 p-1 align-center'
              onClick={() => setFirstRowIsHeader(!firstRowIsHeader)}
            >
              <Checkbox checked={firstRowIsHeader} />
              First row is header
            </div>
            <div
              className='flex cursor-pointer flex-row gap-2 p-1 align-center'
              onClick={() => setDiscardExistingData(!discardExistingData)}
            >
              <Checkbox checked={discardExistingData} />
              Discard existing data ({rows.length} {plural(rows.length, 'record')})
            </div>
            <div className={'mt-4 text-sm'}>
              Previewing {previewLength < recordCount ? `the first ${previewLength} of` : 'all'}{' '}
              {recordCount} {plural(recordCount, 'record')}...
            </div>
            <div
              className={
                'mb-4 flex h-50 w-full flex-col overflow-auto rounded-lg border-2 border-slate-400 text-slate-500'
              }
            >
              <table className={'min-w-full border-collapse bg-white'}>
                <thead>
                  <tr className='text-slate-600'>
                    {headers.map((name, index) => (
                      <th
                        key={index}
                        className='w-24 min-w-24 truncate border-slate-400 border-b-1 p-2 text-left'
                      >
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length > 0 && (
                    <tr>
                      <td
                        colSpan={headers.length}
                        className={cn(
                          'h-8 border-slate-400 border-b-1 border-dashed px-2',
                          discardExistingData && 'text-tomato-600'
                        )}
                      >
                        <div className=''>
                          {discardExistingData
                            ? `...discarding existing ${rows.length} ${plural(rows.length, 'record')}`
                            : `...existing ${rows.length} ${plural(rows.length, 'record')}`}
                        </div>
                      </td>
                    </tr>
                  )}
                  {records
                    .slice(firstRowOffset, previewLength + firstRowOffset)
                    .map((record, rowIndex) => (
                      <tr key={rowIndex}>
                        {record.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className='border-slate-400 border-b-1 border-l-1 p-2 text-left align-top first:border-l-0'
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {error && (
          <div className='mb-4 rounded-md bg-red-50 p-3 text-sm text-tomato-700'>
            Error importing: {error.message}
          </div>
        )}

        <DialogActions className='mt-0 flex w-full gap-4'>
          {records ? (
            <>
              <SecondaryButton size='medium' onClick={onBack}>
                Back
              </SecondaryButton>
              <FlatPrimaryButton size='medium' onClick={onImport}>
                {discardExistingData ? 'Replace' : 'Append'}
              </FlatPrimaryButton>
            </>
          ) : (
            <SecondaryButton size='medium' onClick={onCancel}>
              Cancel
            </SecondaryButton>
          )}
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
