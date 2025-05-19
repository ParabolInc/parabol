import linearLogo from '../styles/theme/images/graphics/linear.svg'

const LinearSVG = () => (
  <div
    style={{
      backgroundImage: `url("${linearLogo}")`,
      height: '48px',
      width: '48px',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center'
    }}
  />
)

const LinearProviderLogo = () => {
  return (
    <div className='mr-4 flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-sm'>
      <LinearSVG />
    </div>
  )
}

export default LinearProviderLogo
