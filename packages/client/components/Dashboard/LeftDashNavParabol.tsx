import PlainButton from '~/components/PlainButton/PlainButton'
import parabolLogo from '../../styles/theme/images/brand/lockup_color_mark_dark_type.svg'
import parabolLogoWhite from '../../styles/theme/images/brand/lockup_color_mark_white_type.svg'

const LeftDashParabol = () => {
  return (
    <PlainButton className='flex w-full select-none items-center p-2 font-semibold text-fg-nav text-sm leading-[22px]'>
      <img crossOrigin='' src={parabolLogo} alt='Parabol logo' className='dark:hidden' />
      <img crossOrigin='' src={parabolLogoWhite} alt='Parabol logo' className='hidden dark:block' />
    </PlainButton>
  )
}

export default LeftDashParabol
