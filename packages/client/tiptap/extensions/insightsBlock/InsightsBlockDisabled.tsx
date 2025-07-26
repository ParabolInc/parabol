import ExtensionOffIcon from '@mui/icons-material/ExtensionOff'
import {ContactInfo} from '../../../types/constEnums'
export const InsightsBlockDisabled = () => {
  return (
    <div
      contentEditable={false}
      className='flex items-center justify-center gap-4 rounded-lg p-4 text-sm text-slate-800'
    >
      <div className='flex items-center justify-center rounded-full p-2'>
        {/* Replace with your actual icon if needed */}
        <ExtensionOffIcon className='size-12 text-slate-600' />
      </div>
      <div className='flex flex-col'>
        <div>
          <span className='font-semibold'>Insights are disabled</span> for your organization.
        </div>
        <div className=''>
          <a
            href={`mailto:${ContactInfo.EMAIL_LOVE}`}
            className='font-semibold! text-sky-500! no-underline!'
          >
            Contact us
          </a>{' '}
          for support.
        </div>
      </div>
    </div>
  )
}
