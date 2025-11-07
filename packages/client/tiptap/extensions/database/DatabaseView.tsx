import {Add, DeleteOutline} from '@mui/icons-material'
import {ColumnDef, flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import {useMemo} from 'react'
import * as Y from 'yjs'
import {cn} from '../../../ui/cn'
import {Cell} from './Cell'
import {appendColumn, appendRow, ColumnId, ColumnMeta, deleteRow, RowId} from './data'
import {Header} from './Header'
import {useYArray, useYMap} from './hooks'

const getRowId = (row: RowId) => row

export function DatabaseView(props: {doc: Y.Doc}) {
  const {doc} = props

  const yColumns = useYArray(doc.getArray<ColumnId>('columns'))
  const rows = useYArray(doc.getArray<RowId>('rows'))

  const columnMeta = useYMap(doc.getMap<ColumnMeta>('columnMeta'))

  const columns = useMemo(() => {
    const dataColumns: ColumnDef<ColumnId>[] = yColumns.map((id, index) => {
      let meta = columnMeta.get(id)
      if (!meta) {
        meta = {name: `Column ${index + 1}`, type: 'text'}
        doc.getMap<ColumnMeta>('columnMeta').set(id, meta)
      }
      return {
        id,
        size: 200,
        minSize: 100,
        maxSize: 500,
        enableResizing: true,
        header: () => <Header key={id} columnMeta={meta} doc={doc} columnId={id} />,
        cell: ({row}) => (
          <Cell type={columnMeta.get(id)?.type || 'text'} doc={doc} rowId={row.id} columnId={id} />
        )
      }
    })
    return [
      ...dataColumns,
      {
        id: 'append',
        size: 48,
        minSize: 48,
        maxSize: 48,
        enableResizing: false,
        header: () => (
          <div
            className='flex w-full cursor-pointer items-center p-2 hover:bg-slate-100'
            onClick={() => appendColumn(doc)}
          >
            <Add />
          </div>
        ),
        cell: ({row}) => (
          <div
            className='group flex w-full cursor-pointer items-center p-2'
            onClick={() => deleteRow(doc, row.id)}
          >
            <DeleteOutline className='invisible text-slate-600 group-hover:visible' />
          </div>
        )
      }
    ] as ColumnDef<RowId>[]
  }, [yColumns, columnMeta, doc])

  const table = useReactTable({
    data: rows,
    getRowId,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange'
  })

  const isResizing = table.getState().columnSizingInfo.isResizingColumn

  return (
    <table
      className={cn('table-fixed border-collapse bg-white', isResizing && 'select-none')}
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
                className='border-slate-400 border-b-1 p-0'
                style={{width: header.getSize()}}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {header.column.getCanResize() && (
                  <div
                    className={cn(
                      '-right-1 absolute top-0 h-full w-2 cursor-col-resize touch-none select-none hover:bg-slate-300',
                      header.column.getIsResizing() && '-right-1 w-2 bg-sky-300 hover:bg-sky-300'
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
              <td key={cell.id} className='border-slate-400 border-b-1 border-l-1 first:border-l-0'>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className='text-slate-600'>
          <td
            colSpan={columns.length}
            className='cursor-pointer hover:bg-slate-100'
            onClick={() => appendRow(doc)}
          >
            <div className='flex w-full cursor-pointer items-center gap-2 p-2 hover:bg-slate-100'>
              <Add />
              New entry
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  )
}
