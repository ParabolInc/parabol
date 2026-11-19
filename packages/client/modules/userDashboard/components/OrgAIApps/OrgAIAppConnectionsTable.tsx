import type {ReactNode} from 'react'

interface Props {
  isEmpty: boolean
  children: ReactNode
}

const OrgAIAppConnectionsTable = ({isEmpty, children}: Props) => (
  <div className='overflow-x-auto border-hairline border-t'>
    <table className='w-full border-collapse text-sm'>
      <thead>
        <tr className='border-hairline border-b bg-surface-raised text-left text-fg-muted text-xs uppercase tracking-wider'>
          <th className='px-4 py-2 font-semibold'>Member</th>
          <th className='px-4 py-2 font-semibold'>App</th>
          <th className='px-4 py-2 font-semibold'>Can do</th>
          <th className='px-4 py-2 font-semibold'>Connected</th>
          <th className='px-4 py-2 font-semibold'>Last used</th>
          <th className='px-4 py-2'>
            <span className='sr-only'>Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {children}
        {isEmpty && (
          <tr>
            <td colSpan={6} className='p-8 text-center text-fg-muted text-sm'>
              No connections match your filter.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)

export default OrgAIAppConnectionsTable
