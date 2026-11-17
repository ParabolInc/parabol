import {ExternalLinks} from '../types/constEnums'
import type {CorsOptions} from '../types/cors'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  handleClick: () => void
  corsOptions: CorsOptions
}

const label = 'Export to CSV'

const ExportToCSVButton = (props: Props) => {
  const {handleClick, corsOptions} = props
  return (
    <PlainButton className='flex items-center justify-end' onClick={handleClick}>
      <img
        className='pr-2 [filter:sepia(100%)_hue-rotate(195deg)_saturate(1500%)]'
        alt={label}
        src={`${ExternalLinks.EMAIL_CDN}cloud_download.png`}
        {...corsOptions}
      />
      <div className='font-semibold text-[14px] text-sky-400'>{label}</div>
    </PlainButton>
  )
}

export default ExportToCSVButton
