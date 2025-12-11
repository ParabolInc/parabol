import {HocuspocusProvider} from '@hocuspocus/provider'
import {Add, DeleteOutline} from '@mui/icons-material'
import {ColumnDef, flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import {Editor} from '@tiptap/core'
import {useMemo} from 'react'
import {cn} from '../../../ui/cn'
import {Cell} from './Cell'
import {appendColumn, appendRow, deleteRow, getColumns, getRows, RowId} from './data'
import {Header} from './Header'
import {useYArray} from './hooks'
import {ImportExport} from './ImportExport'
import {MetaCell} from './MetaCell'

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

  /*
  const headerRefs = useRef<{[key: string]: HTMLButtonElement | null}>({})
  const cellRefs = useRef<{[key: string]: HTMLDivElement | null}>({})
  const [focused, setFocusedState] = useState('')

  const setFocused = useCallback((focused) => {
    if (focused) {
      const headerRef = headerRefs.current[focused]
      const cellRef = cellRefs.current[focused]
      //requestAnimationFrame(() => {
        console.log('Focusing', {focused, headerRef, cellRef})
        if (headerRef) {
          headerRef.focus()
        } else if (cellRef) {
          cellRef.focus()
        }
      //})
    }
    setFocusedState(focused)
  }, [focused])

  const focusCallback = useCallback((columnId: string, rowId?: string) => {
    const columnIndex = columns.findIndex((col) => col.id === columnId)
    if (!rowId) {
      // header navigation
      return (direction: 'focus' | 'left' | 'right' | 'up' | 'down') => {
        if (direction === 'focus') {
          setFocused(columnId)
          return
        }
        if (direction === 'left') {
          if (columnIndex > 0) {
            const nextColumnId = columns[columnIndex - 1]!.id
            setFocused(nextColumnId)
          }
        }
        if (direction === 'right') {
          if (columnIndex < columns.length -1) {
            const nextColumnId = columns[columnIndex + 1]!.id
            setFocused(nextColumnId)
          }
        }
        if (direction === 'down') {
          const firstRowId = rows[0]
          if (firstRowId) {
            setFocused(`${columnId}-${firstRowId}`)
          }
        }
      }
    } else {
      // cell navigation
      const rowIndex = rows.findIndex((id) => id === rowId)
      return (direction: 'focus' | 'left' | 'right' | 'up' | 'down') => {
        if (direction === 'focus') {
          setFocused(`${columnId}-${rowId}`)
          return
        }
        if (direction === 'left') {
          if (columnIndex > 0) {
            const nextColumnId = columns[columnIndex - 1]!.id
            setFocused(`${nextColumnId}-${rowId}`)
          }
        }
        if (direction === 'right') {
          if (columnIndex < columns.length -1) {
            const nextColumnId = columns[columnIndex + 1]!.id
            setFocused(`${nextColumnId}-${rowId}`)
          }
        }
        if (direction === 'up') {
          if (rowIndex > 0) {
            const nextRowId = rows[rowIndex - 1]!
            setFocused(`${columnId}-${nextRowId}`)
          } else {
            // move to header
            setFocused(columnId)
          }
        }
        if (direction === 'down') {
          if (rowIndex > -1 && rowIndex < rows.length - 1) {
            const nextRowId = rows[rowIndex + 1]!
            setFocused(`${columnId}-${nextRowId}`)
          }
        }
      }
    }
  }, [headerRefs, cellRefs])

  const addFocusRef = useCallback((ref: HTMLDivElement | HTMLButtonElement | null, columnId: string, rowId?: string) => {
    const key = rowId ? `${columnId}-${rowId}` : columnId
    if (rowId) {
      cellRefs.current[key] = ref as HTMLDivElement | null
    } else {
      headerRefs.current[key] = ref as HTMLButtonElement | null
    }
  }, [cellRefs, focused])
  */

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
    <>
      <div className='flex w-full flex-row justify-end'>
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
                    className='border-slate-400 border-b-1 p-0'
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
                    className='border-slate-400 border-b-1 border-l-1 first:border-l-0'
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
                className='cursor-pointer hover:bg-slate-100'
                onClick={() => appendRow(doc, userId)}
                contentEditable={false}
              >
                <div className='w-full cursor-pointer hover:bg-slate-100'>
                  <div className='sticky left-0 flex w-fit items-center gap-2 p-2'>
                    <Add />
                    New entry
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  )
}
