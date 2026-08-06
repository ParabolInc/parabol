import {Close} from '~/ui/icons'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  closeSpotlight: () => void
}

const SpotlightTopBar = (prop: Props) => {
  const {closeSpotlight} = prop
  return (
    <div className='flex items-center justify-center'>
      <div className='text-center font-semibold text-[16px] text-fg-primary'>
        Find cards with similar reflections
      </div>
      <PlainButton className='absolute right-4 h-6' onClick={closeSpotlight}>
        <Close className='cursor-pointer text-fg-secondary hover:text-fg-primary focus:text-fg-primary' />
      </PlainButton>
    </div>
  )
}

export default SpotlightTopBar
