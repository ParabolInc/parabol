import type {Editor, EditorEvents} from '@tiptap/react'
import {useEffect, useMemo, useState} from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import {getPageLinks} from '../../shared/tiptap/getPageLinks'
import {isPageLink} from '../../shared/tiptap/isPageLink'
import {getRecordHeaders, importRecords} from '../../tiptap/extensions/database/importRecords'
import {providerManager} from '../../tiptap/providerManager'
import {Button} from '../../ui/Button/Button'
import {Checkbox} from '../../ui/Checkbox/Checkbox'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogActions} from '../../ui/Dialog/DialogActions'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import {Spinner} from '../../ui/Spinner/Spinner'
import {parseDatabaseImport} from '../../utils/parseDatabaseImport'
import plural from '../../utils/plural'

declare module '@tiptap/core' {
  interface EditorEvents {
    importDatabase: {file: File; targetType: 'csv' | 'xlsx'; pos: number | undefined}
  }
}

type Props = {
  editor: Editor
}

export const ImportDatabaseDialog = (props: Props) => {
  const {editor} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const [firstRowIsHeader, setFirstRowIsHeader] = useState(true)
  const firstRowOffset = firstRowIsHeader ? 1 : 0

  const [importingFile, setImportingFile] = useState<{file: File; pos: number | undefined} | null>(
    null
  )
  const [records, setRecords] = useState<(string | null)[][] | null>(null)

  useEffect(() => {
    const importData = (change: EditorEvents['importDatabase']) => {
      const {file, targetType, pos} = change
      setImportingFile({file, pos})

      parseDatabaseImport(file)
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
    return getRecordHeaders(records, firstRowIsHeader)
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

  const [isImporting, setIsImporting] = useState(false)

  const onImport = async () => {
    if (!records || !importingFile) return
    setIsImporting(true)
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

    try {
      const pageId = await new Promise<string>((resolve, reject) => {
        const observer = (events: any[]) => {
          events.forEach(async (e: any) => {
            if (isPageLink(e.target) && e.target.getAttribute('title') === title) {
              const pageCode = e.target.getAttribute('pageCode')
              if (pageCode !== -1) {
                clearTimeout(timeout)
                root.unobserveDeep(observer)
                const pageId = `page:${pageCode}`
                resolve(pageId)
              }
            }
          })
        }
        const timeout = setTimeout(() => {
          root.unobserveDeep(observer)
          reject(new Error('Timed out waiting for page link to be created'))
        }, 30000)

        root.observeDeep(observer)

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
      })

      const provider = providerManager.register(pageId)
      const {document: doc} = provider

      importRecords(doc, viewerId, records, {firstRowIsHeader})
    } catch (error) {
      console.error('Failed to import records', error)
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'corruptedCSV',
        message: `Failed to import ${file.name}`,
        autoDismiss: 5
      })
    }

    setIsImporting(false)
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
      <DialogContent className='absolute z-10 lg:w-4xl lg:max-w-4xl xl:w-5xl xl:max-w-5xl'>
        <DialogTitle className='mb-4'>Import Data</DialogTitle>
        {isImporting && (
          <div className='absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center bg-surface-card/50'>
            <Spinner />
          </div>
        )}
        <div className='mb-3 text-left text-sm'>
          <div className='font-semibold text-fg-secondary'>Import settings</div>
          <div
            className='flex cursor-pointer items-center gap-2 py-1'
            onClick={() => setFirstRowIsHeader(!firstRowIsHeader)}
          >
            <Checkbox checked={firstRowIsHeader} />
            First row is header
          </div>
          <div className='mt-4 mb-2 text-fg-secondary'>
            Previewing {previewLength < recordCount ? `the first ${previewLength} of` : 'all'}{' '}
            {recordCount} {plural(recordCount, 'record')}...
          </div>
          <div className='mb-4 flex max-h-50 w-full flex-col overflow-auto rounded-lg border border-hairline bg-surface-card'>
            <table className='relative min-w-full border-collapse [&_tbody_tr:last-child_td]:border-b-0'>
              <thead>
                <tr className='bg-surface-raised text-fg-secondary'>
                  {headers.map((name, index) => (
                    <th
                      key={index}
                      className='w-24 min-w-24 truncate border-hairline border-b border-l px-3 py-2 text-left font-medium first:border-l-0'
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
                          className='border-hairline border-b border-l px-3 py-2 text-left align-top first:border-l-0'
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                {moreRecordsCount > 0 && (
                  <tr>
                    <td
                      colSpan={headers.length}
                      className='h-8 border-hairline border-b border-dashed px-3 text-fg-muted'
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
          <Button variant='outline' size='md' onClick={onUpload}>
            Cancel & Upload
          </Button>
          <Button variant='primary' size='md' onClick={onImport}>
            Import
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
