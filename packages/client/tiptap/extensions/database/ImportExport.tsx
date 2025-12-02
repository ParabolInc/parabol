import {Parser} from '@json2csv/plainjs'
import {FileDownload, FileUpload, MoreVert} from '@mui/icons-material'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {Editor} from '@tiptap/core'
import {useState} from 'react'
import * as Y from 'yjs'
import {toSlug} from '../../../shared/toSlug'
import {quickHash} from '../../../shared/utils/quickHash'
import {getColumnMeta, getColumns, getData, getRows} from './data'
import {ImportDialog} from './ImportDialog'

export const ImportExport = (props: {doc: Y.Doc; editor: Editor}) => {
  const {doc, editor} = props

  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const exportCSV = async () => {
    const pageTitle = editor.state.doc.firstChild?.textContent ?? 'Untitled'
    const pageTitleSlug = toSlug(pageTitle)

    const columns = getColumns(doc)
    const rows = getRows(doc)
    const columnMeta = getColumnMeta(doc)
    const data = getData(doc)

    const headers = columns.toArray().map((columnId, index) => {
      const meta = columnMeta.get(columnId)
      return {
        id: columnId,
        name: meta?.name ?? `Column ${index + 1}`
      }
    })

    const rowRecords = [] as Record<string, string>[]
    rows.forEach((rowId) => {
      const row = data.get(rowId)
      const rowRecord = {} as Record<string, string>
      headers.forEach(({id, name}) => {
        const value = row?.get(id) ?? ''
        // TODO convert to type-specific formats, i.e. if the type would filter this one out, so should we
        rowRecord[name] = value
      })
      rowRecords.push(rowRecord)
    })

    const parser = new Parser({
      withBOM: true,
      eol: '\n'
    })

    const csvString = parser.parse(rowRecords)
    const hash = await quickHash([csvString])
    const blob = new Blob([csvString], {type: 'text/csv;charset=utf-8;'})
    const encodedUri = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Parabol_${pageTitleSlug}_database_${hash}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <div className='items-cursor-pointer flex w-10 items-center justify-center rounded-full p-2 hover:bg-slate-100'>
            <MoreVert />
          </div>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            asChild
            className='bg-white p-2 text-slate-800'
            align='start'
            collisionPadding={8}
          >
            <div className='top-0 left-0 flex max-h-[var(--radix-popper-available-height)] max-w-[var(--radix-popover-content-available-width)] flex-col overflow-hidden rounded-lg shadow-dialog data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'>
              <DropdownMenu.Item
                className='flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-slate-100'
                onSelect={() => setImportDialogOpen(true)}
              >
                <FileUpload />
                Import CSV
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className='flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-slate-100'
                onSelect={exportCSV}
              >
                <FileDownload />
                Export CSV
              </DropdownMenu.Item>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <ImportDialog
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        doc={doc}
      />
    </>
  )
}
