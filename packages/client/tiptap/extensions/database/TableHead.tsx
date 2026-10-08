import {flexRender, Table} from '@tanstack/react-table'
import {cn} from '../../../ui/cn'

export const TableHead = ({table}: {table: Table<string>}) => {
  return (
    <thead>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id} className='bg-surface-raised text-fg-secondary'>
          {headerGroup.headers.map((header) => (
            <th
              key={header.id}
              className='h-9 pointer-coarse:h-11 border-hairline border-b border-l p-0 text-left first:border-l-0'
              style={header.column.getCanResize() ? {width: header.getSize()} : {}}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
              {header.column.getCanResize() && (
                <div
                  className={cn(
                    '-right-1 absolute top-0 z-1 h-full w-2 cursor-col-resize touch-none select-none after:absolute after:inset-y-0 after:left-[3px] after:w-0.5 after:bg-accent after:opacity-0 hover:after:opacity-100',
                    header.column.getIsResizing() && 'after:opacity-100'
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
  )
}
