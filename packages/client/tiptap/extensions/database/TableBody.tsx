import {flexRender, Table} from '@tanstack/react-table'
import {useVirtualizer} from '@tanstack/react-virtual'

export const TableBody = ({table}: {table: Table<string>}) => {
  const {rows} = table.getRowModel()

  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    getScrollElement: () => {
      const scoller = document.getElementById('main') as HTMLDivElement
      return scoller
    },
    estimateSize: () => 48,
    overscan: 40
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  const paddingTop = virtualItems[0]?.start ?? 0
  const paddingBottom =
    rowVirtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end ?? 0)
  return (
    <tbody className='h-full w-full' style={{height: rowVirtualizer.getTotalSize()}}>
      <tr>
        <td style={{height: paddingTop}} />
      </tr>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index]!
        return (
          <tr
            key={row.id}
            className=''
            data-index={virtualRow.index}
            ref={(el) => rowVirtualizer.measureElement(el)}
          >
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className='h-12 border-slate-400 border-b-1 border-l-1 first:border-l-0 first:pl-1 last:pr-1'
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        )
      })}
      <tr>
        <td style={{height: paddingBottom}} />
      </tr>
    </tbody>
  )
}
