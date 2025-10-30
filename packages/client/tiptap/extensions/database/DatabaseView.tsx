import {Add, CheckBox, Label, Notes, Numbers, Sell} from '@mui/icons-material'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {ColumnDef, flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import {ReactNode, useCallback, useEffect, useMemo, useState} from 'react'
import * as Y from 'yjs'

/**
 * Inspired by:
 * https://gchwp.csb.app
 * https://www.bartoszsypytkowski.com/yrs-csv-table/
 *
 */

export function randomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 95%, 90%)`
}

const useYArray = <T,>(array: Y.Array<T>) => {
  const [items, setItems] = useState<T[]>(array.toArray())

  useEffect(() => {
    const updateItems = (array: Y.Array<T>) => {
      setItems(array.toArray())
    }

    const observeArray = (event: Y.YArrayEvent<T>) => {
      updateItems(event.target)
    }

    array.observe(observeArray)
    updateItems(array)

    return () => {
      array.unobserve(observeArray)
    }
  }, [array])

  return items
}

const useYText = (ytext: Y.Text) => {
  const [text, setText] = useState<string>(ytext.toString())

  useEffect(() => {
    const updateText = (ytext: Y.Text) => {
      setText(ytext.toString())
    }

    const observeText = (event: Y.YTextEvent) => {
      updateText(event.target)
    }

    ytext.observe(observeText)
    updateText(ytext)

    return () => {
      ytext.unobserve(observeText)
    }
  }, [ytext])

  return text
}

// User, Task, Meeting would make sense as well
export type DataTypes = 'text' | 'number' | 'check' | 'status' | 'tags'
export const DataTypeIcons: Record<DataTypes, ReactNode> = {
  text: <Notes />,
  number: <Numbers />,
  check: <CheckBox />,
  status: <Label />,
  tags: <Sell />
}

type ColumnId = string
type RowId = string
const getRowId = (row: RowId) => row

const TextCell = ({text}: {text: Y.Text}) => {
  const value = useYText(text)
  return (
    <>
      <input
        className='w-full'
        value={value}
        onChange={(e) => {
          // TODO this is wrong
          text.delete(0, text.length)
          text.insert(0, e.target.value)
        }}
      />
    </>
  )
}

const NumberCell = ({text}: {text: Y.Text}) => {
  const rawValue = useYText(text)

  const value = (() => {
    if (!rawValue) return undefined
    const conv = Number(rawValue)
    if (isNaN(conv)) return undefined
    return conv
  })()

  return (
    <>
      <input
        className='w-full'
        type='number'
        value={value}
        onChange={(e) => {
          text.delete(0, text.length)
          text.insert(0, e.target.value)
        }}
      />
    </>
  )
}

const CheckCell = ({text}: {text: Y.Text}) => {
  const value = useYText(text)
  const checked = value === 'true'
  return (
    <>
      <input
        className='w-full'
        type='checkbox'
        checked={checked}
        onChange={(e) => {
          text.delete(0, text.length)
          text.insert(0, e.target.checked ? 'true' : 'false')
        }}
      />
    </>
  )
}

const Header = (props: {doc: Y.Doc; columnId: ColumnId}) => {
  const {doc, columnId} = props
  const title = useYText(doc.getText(`${columnId}-name`))
  const type = useYText(doc.getText(`${columnId}-type`))

  const changeType = useCallback(
    (newType: string) => {
      const type = doc.getText(`${columnId}-type`)
      type.delete(0, type.length)
      type.insert(0, newType)
    },
    [doc]
  )

  return (
    <div className='flex items-center gap-2'>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          {DataTypeIcons[type as DataTypes] || <Notes />}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content asChild className='bg-white p-2' align='start' collisionPadding={8}>
            <div className='top-0 left-0 flex max-h-[var(--radix-popper-available-height)] max-w-[var(--radix-popover-content-available-width)] flex-col overflow-hidden rounded-lg shadow-dialog data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'>
              <DropdownMenu.RadioGroup value={type} onValueChange={changeType}>
                {Object.entries(DataTypeIcons).map(([type, icon]) => (
                  <DropdownMenu.RadioItem
                    key={type}
                    value={type}
                    className='flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-slate-200 data-[state=checked]:bg-slate-300'
                  >
                    {icon}
                    {type}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <input
        value={title}
        onChange={(e) => {
          const ytext = doc.getText(`${columnId}-name`)
          ytext.delete(0, ytext.length)
          ytext.insert(0, e.target.value)
        }}
      />
    </div>
  )
}

const Cell = (props: {doc: Y.Doc; rowId: RowId; columnId: ColumnId}) => {
  const {doc, rowId, columnId} = props
  const id = `${rowId}-${columnId}`

  const type = useYText(doc.getText(`${columnId}-type`))
  const text = doc.getText(id)

  switch (type) {
    case 'number':
      return <NumberCell text={text} />
    case 'check':
      return <CheckCell text={text} />
    default:
      return <TextCell text={text} />
  }
}

export function DatabaseView(props: {doc: Y.Doc}) {
  const {doc} = props

  const yColumns = useYArray<ColumnId>(doc.getArray<ColumnId>('columns'))
  const columns: ColumnDef<RowId>[] = useMemo(() => {
    return yColumns.map((id) => ({
      id
    }))
  }, [yColumns])
  const rows = useYArray<RowId>(doc.getArray<RowId>('rows'))

  const appendColumn = useCallback(() => {
    const id = Math.random().toString(36).substring(2, 9)
    const columns = doc.getArray<ColumnId>('columns')
    columns.push([id])
    doc.getText(`${id}-type`).insert(0, 'text')
    doc.getText(`${id}-name`).insert(0, `New column ${columns.length}`)
  }, [doc])

  const appendRow = useCallback(() => {
    doc.getArray<RowId>('rows').push([Math.random().toString(36).substring(2, 9)])
  }, [doc])

  const defaultColumn: Partial<ColumnDef<RowId>> = useMemo(
    () => ({
      size: 200,
      minSize: 50,
      maxSize: 500,
      enableResizing: true,
      header: ({column}) => <Header doc={doc} columnId={column.id} />,
      cell: ({row, column}) => <Cell doc={doc} rowId={row.id} columnId={column.id} />
    }),
    [doc]
  )

  const table = useReactTable({
    data: rows,
    getRowId,
    columns,
    defaultColumn,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <table className='border-collapse'>
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((header) => (
              <th
                key={header.id}
                className='border-slate-300 border-r-1 bg-slate-100 first:rounded-l-lg'
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
            <th className='w-10 rounded-r-lg bg-slate-100'>
              <button onClick={appendColumn}>
                <Add />
              </button>
            </th>
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className='border-slate-300 border-b-1 border-l-1 first:border-l-0'>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
            <td className='w-10 border-slate-300 border-b-1'>
              <div></div>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td
            colSpan={columns.length + 1}
            className='cursor-pointer border-slate-300 border-b-1 hover:bg-slate-100'
            onClick={appendRow}
          >
            <div className='flex items-center text-slate-700'>
              <Add />
              Add entry
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  )
}
