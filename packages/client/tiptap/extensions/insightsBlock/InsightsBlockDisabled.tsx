import ExtensionOffIcon from '@mui/icons-material/ExtensionOff'
import {ContactInfo} from '../../../types/constEnums'
export const InsightsBlockDisabled = () => {
  return (
    <div
      contentEditable={false}
      className='flex items-center justify-center gap-4 rounded-lg p-4 text-fg-primary text-sm'
    >
      <div className='flex items-center justify-center rounded-full p-2'>
        {/* Replace with your actual icon if needed */}
        <ExtensionOffIcon className='size-12 text-fg-secondary' />
      </div>
      <div className='flex flex-col'>
        <div>
          <span className='font-semibold'>Insights are disabled</span> for your organization.
        </div>
        <div className=''>
          <a
            href={`mailto:${ContactInfo.EMAIL_LOVE}`}
            className='no-underline! font-semibold! text-accent!'
          >
            Contact us
          </a>{' '}
          for support.
        </div>
      </div>
    </div>
  )
}
