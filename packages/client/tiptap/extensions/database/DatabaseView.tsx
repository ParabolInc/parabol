import {HocuspocusProvider} from '@hocuspocus/provider'
import {ColumnDef, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import {Editor} from '@tiptap/core'
import {useMemo} from 'react'
import {cn} from '../../../ui/cn'
import {AppendCell} from './AppendCell'
import {AppendHeader} from './AppendHeader'
import {AppendRow} from './AppendRow'
import {Cell} from './Cell'
import {getColumns, getRows, RowId} from './data'
import {Header} from './Header'
import {useYArray} from './hooks'
import {ImportExport} from './ImportExport'
import {MetaCell} from './MetaCell'
import {TableBody} from './TableBody'
import {TableHead} from './TableHead'

// add additional debug columns
const DEBUG = false

const getRowId = (row: RowId) => row

type Props = {
  provider: HocuspocusProvider
  userId?: string
  editor: Editor
}

export default function DatabaseView(props: Props) {
  const {provider, editor, userId} = props
  const doc = provider.document

  const columns = useYArray(getColumns(doc))
  const rows = useYArray(getRows(doc))

  const dataColumns = useMemo(() => {
    const dataColumns: ColumnDef<RowId>[] = columns.map((columnId) => {
      return {
        id: columnId,
        size: 200,
        minSize: 100,
        maxSize: 500,
        enableResizing: true,
        header: () => (
          <>
            <Header provider={provider} columnId={columnId} />
            {DEBUG && <div className='p-1 text-fg-secondary text-xs'>{columnId}</div>}
          </>
        ),
        cell: ({row}) => (
          <Cell provider={provider} rowId={row.id} columnId={columnId} userId={userId} />
        )
      }
    })
    const debugColumns: ColumnDef<RowId>[] = !DEBUG
      ? []
      : [
          {
            id: 'debug',
            size: 80,
            minSize: 80,
            maxSize: 80,
            enableResizing: false,
            header: () => <div className='p-2 text-xs'>Row ID</div>,
            cell: ({row}) => <div className='p-2 text-fg-secondary text-xs'>{row.id}</div>
          },
          ...['_createdAt', '_createdBy', '_updatedAt', '_updatedBy'].map(
            (metaId) =>
              ({
                id: metaId,
                size: 120,
                minSize: 120,
                maxSize: 120,
                enableResizing: false,
                header: () => <div className='p-2 text-xs'>{metaId}</div>,
                cell: ({row}) => <MetaCell doc={doc} rowId={row.id} columnId={metaId} />
              }) as ColumnDef<RowId>
          )
        ]

    return [
      ...debugColumns,
      ...dataColumns,
      {
        id: 'append',
        size: 48,
        minSize: 48,
        enableResizing: false,
        header: () => <AppendHeader provider={provider} />,
        cell: ({row}) => <AppendCell provider={provider} rowId={row.id} />
      }
    ] as ColumnDef<RowId>[]
  }, [columns])

  const table = useReactTable({
    data: rows,
    getRowId,
    columns: dataColumns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange'
  })

  const isResizing = table.getState().columnSizingInfo.isResizingColumn

  return (
    <div className='text-fg-primary text-sm leading-5'>
      <div className='-top-9 absolute right-0 print:hidden'>
        <ImportExport doc={doc} editor={editor} />
      </div>
      <div className='overflow-hidden rounded-lg border border-hairline bg-surface-card'>
        <div className='overflow-x-auto'>
          <table
            className={cn(
              // the editor's table styles set overflow: hidden, which would stop the footer label sticking to the scroll container
              'overflow-visible! relative min-w-full table-fixed border-collapse',
              isResizing && 'select-none'
            )}
            style={{
              width: table.getTotalSize()
            }}
            draggable={false}
          >
            <TableHead table={table} />
            <TableBody table={table} />
            <tfoot>
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className='h-9 pointer-coarse:h-11 p-0'
                  contentEditable={false}
                >
                  <AppendRow provider={provider} userId={userId} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
