import {Add, DeleteOutline} from '@mui/icons-material'
import {ColumnDef, flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import {useMemo} from 'react'
import * as Y from 'yjs'
import {cn} from '../../../ui/cn'
import {Cell} from './Cell'
import {appendColumn, appendRow, deleteRow, RowId} from './data'
import {Header} from './Header'
import {useDatabase} from './hooks'
import {MetaCell} from './MetaCell'

// add additional debug columns
const DEBUG = false

const getRowId = (row: RowId) => row

type Props = {
  doc: Y.Doc
  userId?: string
}

export default function DatabaseView(props: Props) {
  const {doc, userId} = props

  const {rows, columns} = useDatabase(doc)

  const dataColumns = useMemo(() => {
    const dataColumns: ColumnDef<RowId>[] = columns.map((column) => {
      const {id, ...meta} = column
      const {type} = meta

      return {
        id,
        size: 200,
        minSize: 100,
        maxSize: 500,
        enableResizing: true,
        header: () => (
          <>
            <Header key={id} columnMeta={meta} doc={doc} columnId={id} />
            {DEBUG && <div className='p-1 text-slate-600 text-xs'>{id}</div>}
          </>
        ),
        cell: ({row}) => <Cell type={type} doc={doc} rowId={row.id} columnId={id} userId={userId} />
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
            onClick={() => appendRow(doc, userId)}
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
