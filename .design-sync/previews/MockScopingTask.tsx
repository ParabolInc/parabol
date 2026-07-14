import {MockScopingTask} from 'parabol-client'

export const LoadingRow = () => (
  <div className='w-96 rounded bg-white'>
    <MockScopingTask idx={0} />
  </div>
)

export const StaggeredRows = () => (
  <div className='w-96 rounded bg-white'>
    <MockScopingTask idx={0} />
    <MockScopingTask idx={3} />
    <MockScopingTask idx={6} />
  </div>
)
