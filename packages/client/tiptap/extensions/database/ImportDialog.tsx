import {parse} from 'csv-parse/browser/esm'
import {useRef, useState} from 'react'
import * as Y from 'yjs'
import FlatPrimaryButton from '../../../components/FlatPrimaryButton'
import SecondaryButton from '../../../components/SecondaryButton'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'
import {
  appendColumn,
  appendRow,
  deleteColumn,
  getColumnMeta,
  getColumns,
  getData,
  getRows
} from './data'

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

const importCSV = (doc: Y.Doc, file: File, viewerId: string) => {
  return new Promise<Error | null>((resolve) => {
    const columns = getColumns(doc)
    const columnMeta = getColumnMeta(doc)

    const isEmpty = dataIsEmpty(doc)

    if (file.type !== 'text/csv') {
      resolve(new Error('Please upload a valid CSV file.'))
      return
    }

    const currentHeaders = columns.toArray().map((columnId, index) => {
      const meta = columnMeta.get(columnId)
      return {
        id: columnId,
        name: meta?.name ?? `Column ${index + 1}`
      }
    })
    if (isEmpty) {
      columns.forEach((columnId) => {
        deleteColumn(doc, columnId)
      })
      currentHeaders.splice(0, currentHeaders.length)
    }

    const parser = parse({
      bom: true,
      columns: (headers: string[]) => {
        for (let i = 0; i < currentHeaders.length && i < headers.length; i++) {
          if (headers[i] !== currentHeaders[i]!.name) {
            throw new Error(HEADER_MISMATCH)
          }
        }
        if (currentHeaders.length < headers.length) {
          headers.slice(currentHeaders.length).forEach((header) => {
            const id = appendColumn(doc, {name: header, type: 'text'})
            currentHeaders.push({id, name: header})
          })
        }

        return currentHeaders.map((h) => h.id)
      },
      skip_empty_lines: true
    })

    parser.on('readable', function () {
      let record: {}
      while ((record = parser.read()) !== null) {
        appendRow(doc, viewerId, record)
      }
    })
    parser.once('error', function (error) {
      resolve(error)
    })
    parser.once('end', function () {
      resolve(null)
    })

    const decoder = new TextDecoder('utf-8')
    file
      .stream()
      .pipeTo(
        new WritableStream({
          write: (chunk, controller) => {
            return new Promise((resolve, reject) => {
              const decoded = decoder.decode(chunk)
              parser.write(decoded, (error) => {
                if (error) {
                  controller.error(error)
                  reject(error)
                } else {
                  resolve()
                }
              })
            })
          },
          close: () => {
            parser.end()
          }
        })
      )
      .catch(resolve)
  })
}

const rowIsEmpty = (row: Y.Map<string>) => {
  if (row.size === 0) return true
  for (const key of row.keys()) {
    if (!key.startsWith('_')) return false
  }
  return true
}
const dataIsEmpty = (doc: Y.Doc) => {
  const rows = getRows(doc)
  if (rows.length === 0) return true

  const data = getData(doc)
  for (const row of data.values()) {
    if (!rowIsEmpty(row)) {
      return false
    }
  }
  return true
}

type Props = {
  isOpen: boolean
  onClose: () => void
  doc: Y.Doc
}

export const ImportDialog = (props: Props) => {
  const {viewerId} = useAtmosphere()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {isOpen, onClose, doc} = props

  const fileRef = useRef<File | null>(null)
  const [confirmReplace, setConfirmReplace] = useState(false)

  const startImport = async (file: File) => {
    fileRef.current = file
    const error = await importCSV(doc, file, viewerId)
    if (error instanceof Error) {
      if (error.message === HEADER_MISMATCH) {
        setConfirmReplace(true)
      }
    } else {
      fileRef.current = null
      onClose()
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLFormElement>) => {
    const {files} = e.currentTarget
    const file = files ? files[0] : null
    if (!file) return
    startImport(file)
  }

  const onReplaceConfirmed = async () => {
    clearAllData(doc)
    if (fileRef.current) {
      await importCSV(doc, fileRef.current, viewerId)
    }
    setConfirmReplace(false)
    onClose()
  }

  const onChooseFile = () => {
    if (!fileInputRef.current) return
    // let the user upload the same file again
    fileInputRef.current.value = ''
    fileInputRef.current.click()
  }

  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefault(e)
    const file = e.dataTransfer.files[0]
    if (!file) return
    startImport(file)
  }

  const isEmpty = dataIsEmpty(doc)

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent
        className='z-10'
        onDragEnter={preventDefault}
        onDragOver={preventDefault}
        onDrop={onDrop}
      >
        <DialogTitle className='mb-4'>Import CSV</DialogTitle>
        {confirmReplace ? (
          <div className='mb-3 text-left font-semibold text-sm text-tomato-600'>
            The CSV headers do not match the current data, do you want to replace everything?
          </div>
        ) : (
          <>
            <input
              className='hidden'
              ref={fileInputRef}
              type='file'
              accept='.csv'
              onChange={onChange}
            />
            <div className='mb-3 text-left font-semibold text-slate-600 text-sm'>
              {isEmpty
                ? 'Upload a CSV into the database.'
                : 'Upload a CSV to append to the current data.'}
            </div>
          </>
        )}

        <DialogActions>
          {confirmReplace ? (
            <>
              <FlatPrimaryButton size='medium' onClick={onReplaceConfirmed}>
                Replace data
              </FlatPrimaryButton>
            </>
          ) : (
            <FlatPrimaryButton size='medium' onClick={onChooseFile}>
              Upload file
            </FlatPrimaryButton>
          )}
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
