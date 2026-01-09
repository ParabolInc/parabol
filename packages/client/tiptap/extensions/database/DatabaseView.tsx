import {HocuspocusProvider} from '@hocuspocus/provider'
import {ColumnDef, flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
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
import {useFocusedCell} from './useFocus'

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

  const focusedCell = useFocusedCell(provider)

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
            {DEBUG && <div className='p-1 text-slate-600 text-xs'>{columnId}</div>}
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
            cell: ({row}) => <div className='p-2 text-slate-600 text-xs'>{row.id}</div>
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
    <>
      <div className='flex w-full flex-row justify-end'>
        {focusedCell}
        <ImportExport doc={doc} editor={editor} />
      </div>
      <div className='overflow-x-auto pb-2'>
        <table
          className={cn(
            'relative min-w-full table-fixed border-collapse bg-white',
            isResizing && 'select-none'
          )}
          style={{
            width: table.getTotalSize()
          }}
          draggable={false}
        >
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className='text-slate-600'>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className='h-12 border-slate-400 border-b-1 pt-1 first:pl-1 last:pr-1'
                    style={header.column.getCanResize() ? {width: header.getSize()} : {}}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanResize() && (
                      <div
                        className={cn(
                          '-right-1 absolute top-0 h-full w-2 cursor-col-resize touch-none select-none hover:bg-slate-300',
                          header.column.getIsResizing() &&
                            '-right-1 w-2 bg-sky-300 hover:bg-sky-300'
                        )}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className='h-12 border-slate-400 border-b-1 border-l-1 first:border-l-0 first:pl-1 last:pr-1'
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className='text-slate-600'>
              <td
                colSpan={columns.length + 1}
                className='h-12 cursor-pointer p-1 pt-0 hover:bg-slate-100'
                contentEditable={false}
              >
                <AppendRow provider={provider} userId={userId} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  )
}
