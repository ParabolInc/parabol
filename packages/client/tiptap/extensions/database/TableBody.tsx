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
    estimateSize: () => 36,
    overscan: 40
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  const paddingTop = virtualItems[0]?.start ?? 0
  const paddingBottom =
    rowVirtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end ?? 0)
  return (
    <tbody className='h-full w-full' style={{height: rowVirtualizer.getTotalSize()}}>
      <tr>
        <td className='p-0' style={{height: paddingTop}} />
      </tr>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index]!
        return (
          <tr
            key={row.id}
            className='group/row hover:bg-surface-hover'
            data-index={virtualRow.index}
            ref={(el) => rowVirtualizer.measureElement(el)}
          >
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className='h-9 pointer-coarse:h-11 border-hairline border-b border-l p-0 first:border-l-0'
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        )
      })}
      <tr>
        <td className='p-0' style={{height: paddingBottom}} />
      </tr>
    </tbody>
  )
}
