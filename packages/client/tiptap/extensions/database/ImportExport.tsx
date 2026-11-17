import {Parser} from '@json2csv/plainjs'
import {Editor} from '@tiptap/core'
import {useState} from 'react'
import * as Y from 'yjs'
import {FileDownload, FileUpload, MoreVert} from '~/ui/icons'
import {toSlug} from '../../../shared/toSlug'
import {quickHash} from '../../../shared/utils/quickHash'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {MENU_ITEM_ICON, MenuItem} from '../../../ui/Menu/MenuItem'
import {getColumnMeta, getColumns, getRowData, getRows} from './data'
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

    const fields = columns.toArray().map((columnId, index) => {
      const meta = columnMeta.get(columnId)
      return {
        value: columnId,
        label: meta?.name ?? `Column ${index + 1}`
      }
    })

    const rowRecords = rows.map((rowId) =>
      Object.fromEntries(
        getRowData(doc, rowId)
          ?.yarray.toArray()
          .map(({key, val}) => [key, val]) ?? []
      )
    )

    const parser = new Parser({
      fields,
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
      <Menu
        trigger={
          <button
            type='button'
            aria-label='Database options'
            className='flex size-7 cursor-pointer items-center justify-center rounded-md text-fg-secondary hover:bg-surface-hover data-[state=open]:bg-surface-hover'
          >
            <MoreVert className='text-[20px]' />
          </button>
        }
      >
        <MenuContent align='end' sideOffset={4} collisionPadding={8}>
          <MenuItem onSelect={() => setImportDialogOpen(true)}>
            <FileUpload className={MENU_ITEM_ICON} />
            Import data
          </MenuItem>
          <MenuItem onSelect={exportCSV}>
            <FileDownload className={MENU_ITEM_ICON} />
            Export CSV
          </MenuItem>
        </MenuContent>
      </Menu>
      <ImportDialog
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        doc={doc}
      />
    </>
  )
}
