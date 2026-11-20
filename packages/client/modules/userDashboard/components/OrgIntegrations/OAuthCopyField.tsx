import {ContentCopy as ContentCopyIcon} from '~/ui/icons'
import BasicInput from '../../../../components/InputField/BasicInput'

interface Props {
  label: string
  name: string
  value: string
  placeholder?: string
}

const OAuthCopyField = ({label, name, value, placeholder}: Props) => {
  return (
    <div className='space-y-1'>
      <div className='flex h-5 items-center justify-between'>
        <label className='font-semibold text-fg-muted text-xs uppercase tracking-wider'>
          {label}
        </label>
      </div>
      <div className='flex'>
        <div className='relative grow'>
          <BasicInput
            name={name}
            value={value}
            disabled
            placeholder={placeholder}
            onChange={() => {}}
            className='w-full rounded-r-none border-hairline! border-r-0! bg-surface-well font-mono text-sm'
            autoComplete='off'
            error={undefined}
          />
        </div>
        <button
          type='button'
          onClick={() => navigator.clipboard.writeText(value)}
          className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-hairline bg-surface-well px-4 py-0 font-medium text-fg-primary text-sm hover:bg-surface-hover'
        >
          <ContentCopyIcon className='text-[20px]' />
        </button>
      </div>
    </div>
  )
}

export default OAuthCopyField
