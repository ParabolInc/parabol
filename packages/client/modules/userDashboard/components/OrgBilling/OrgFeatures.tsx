import React, {useState} from 'react'
import Toggle from '../../../../components/Toggle/Toggle'

const OrgFeatures = () => {
  const [showAIFeatures, setShowAIFeatures] = useState(false)

  return (
    <div className='relative my-4 w-full rounded bg-white shadow-md'>
      <div className='flex w-full items-center'>
        <div className='px-4 py-2 text-sm font-semibold uppercase'>AI Features</div>
        <div className='flex h-[44px] flex-1 justify-end px-4 py-2 leading-[44px]'></div>
      </div>
      <div className='w-full'>
        <div className='border-t border-slate-300 p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <span>Show AI Features</span>
            <Toggle active={showAIFeatures} onClick={() => setShowAIFeatures(!showAIFeatures)} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrgFeatures
