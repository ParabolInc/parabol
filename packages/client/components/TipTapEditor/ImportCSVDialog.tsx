import type {Editor, EditorEvents} from '@tiptap/react'
import {parseXlsx} from 'extract-xlsx'
import {useEffect, useMemo, useState} from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import {getPageLinks} from '../../shared/tiptap/getPageLinks'
import {isPageLink} from '../../shared/tiptap/isPageLink'
import {appendColumn} from '../../tiptap/extensions/database/data'
import {importRecords} from '../../tiptap/extensions/database/ImportDialog'
import {providerManager} from '../../tiptap/providerManager'
import {Checkbox} from '../../ui/Checkbox/Checkbox'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogActions} from '../../ui/Dialog/DialogActions'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import plural from '../../utils/plural'
import FlatPrimaryButton from '../FlatPrimaryButton'
import SecondaryButton from '../SecondaryButton'
import {parseCSV} from '../UploadCSV'

declare module '@tiptap/core' {
  interface EditorEvents {
    importDatabase: {file: File; targetType: 'csv' | 'xlsx'; pos: number | undefined}
  }
}

const parseXLSX = async (file: File): Promise<string[][]> => {
  const buffer = await file.arrayBuffer()

  const data = await parseXlsx(buffer as any)
  if (!data || data.length === 0) {
    return []
  }

  // data is sparse, make sure the first row has the maxumum length
  const columnCount = Math.max(...data.map((row) => row.length))
  const firstRowLength = data[0]!.length
  data[0]!.length = columnCount
  data[0]!.fill(null, firstRowLength, columnCount)

  return data
}

type Props = {
  editor: Editor
}

export const ImportCSVDialog = (props: Props) => {
  const {editor} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const [firstRowIsHeader, setFirstRowIsHeader] = useState(true)
  const firstRowOffset = firstRowIsHeader ? 1 : 0

  const [importingFile, setImportingFile] = useState<{file: File; pos: number | undefined} | null>(
    null
  )
  const [records, setRecords] = useState<string[][] | null>(null)

  useEffect(() => {
    const importData = (change: EditorEvents['importDatabase']) => {
      const {file, targetType, pos} = change
      setImportingFile({file, pos})

      const parser = targetType === 'csv' ? parseCSV : parseXLSX
      parser(file)
        .then((parsedRecords) => {
          setRecords(parsedRecords)
        })
        .catch((error) => {
          console.error(`Error parsing ${targetType}:`, error)
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'corruptedCSV',
            message: `Failed to load ${targetType}`,
            autoDismiss: 5
          })
          setRecords(null)
        })
    }

    editor.on('importDatabase', importData)
    return () => {
      editor.off('importDatabase', importData)
    }
  }, [editor])

  const headers = useMemo(() => {
    if (!records || records.length === 0) return []

    return records[0]!.map(
      (cell, index) => (firstRowIsHeader && cell?.toString()) || `Column ${index + 1}`
    )
  }, [firstRowIsHeader, records])

  const onClose = () => {
    setRecords(null)
  }

  const onUpload = () => {
    if (!importingFile) return
    const {file, pos} = importingFile
    editor.storage.fileUpload.onUpload(file, editor, 'file', pos)
    setRecords(null)
    setImportingFile(null)
    onClose()
  }

  const onImport = () => {
    if (!records || !importingFile) return
    const {file, pos} = importingFile

    const {schema} = editor
    const doc = editor.storage.pageLinkBlock.yDoc

    const fileName = file.name.replace(/\.[^/.]+$/, '') ?? '<Untitled>'

    let title = fileName
    let suffix = 0
    const existingPageLinks = getPageLinks(doc, true)
    while (existingPageLinks.find((node) => node.getAttribute('title') === title)) {
      suffix += 1
      title = `${fileName} (${suffix})`
    }

    const root = doc.getXmlFragment('default')
    root.observeDeep((events) => {
      events.forEach((e) => {
        if (isPageLink(e.target) && e.target.getAttribute('title') === title) {
          const pageCode = e.target.getAttribute('pageCode')
          if (pageCode !== -1) {
            const pageId = `page:${pageCode}`
            const provider = providerManager.register(pageId)
            const {document: doc} = provider

            headers.forEach((name) => appendColumn(doc, {name, type: 'text'}))
            importRecords(doc, viewerId, records.slice(firstRowOffset))
          }
        }
      })
    })

    const databaseNode = schema.nodes.pageLinkBlock!.create({
      pageCode: -1,
      title,
      canonical: true,
      database: true
    })

    if (pos !== undefined) {
      editor.chain().focus().insertContentAt(pos, databaseNode).run()
    } else {
      editor.chain().focus().insertContent(databaseNode).run()
    }

    setRecords(null)
    setImportingFile(null)
  }

  if (!records) {
    return null
  }

  const recordCount = records.length - firstRowOffset
  const previewLength = recordCount > 4 ? Math.min(3, recordCount) : recordCount
  const moreRecordsCount = recordCount - previewLength

  return (
    <Dialog isOpen={true} onClose={onClose}>
      <DialogContent className='z-10 lg:w-4xl lg:max-w-4xl xl:w-5xl xl:max-w-5xl'>
        <DialogTitle className='mb-4'>Import CSV</DialogTitle>
        <div className='mb-3 text-left font-semibold text-slate-600 text-sm'>
          Import settings
          <div
            className='flex cursor-pointer flex-row gap-2 p-1 align-center'
            onClick={() => setFirstRowIsHeader(!firstRowIsHeader)}
          >
            <Checkbox checked={firstRowIsHeader} />
            First row is header
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
            <table className={'relative min-w-full border-collapse bg-white'}>
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
                {moreRecordsCount && (
                  <tr>
                    <td
                      colSpan={headers.length}
                      className='h-8 border-slate-400 border-b-1 border-dashed px-2'
                    >
                      <div className='-translate-x-1/2 sticky left-1/2 w-fit'>
                        {`...${moreRecordsCount} more records`}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <DialogActions className='mt-0 flex w-full gap-4'>
          <SecondaryButton size='medium' onClick={onUpload}>
            Cancel & Upload
          </SecondaryButton>
          <FlatPrimaryButton size='medium' onClick={onImport}>
            Import
          </FlatPrimaryButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
