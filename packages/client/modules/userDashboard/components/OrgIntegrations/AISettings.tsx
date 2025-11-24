import {Suspense} from 'react'
import {Loader} from '../../../../utils/relay/renderLoader'
import MCPServerIntegration from './MCPServerIntegration'

const AISettings = () => {
  return (
    <Suspense fallback={<Loader />}>
      <div className='flex w-full flex-wrap'>
        <div className='w-[768px] max-w-[768px]'>
          <h1>AI Settings</h1>
          <div className='mb-6 text-base text-slate-700'>
            Configure AI integrations and capabilities for your organization.
          </div>
          <MCPServerIntegration />
        </div>
      </div>
    </Suspense>
  )
}

export default AISettings
