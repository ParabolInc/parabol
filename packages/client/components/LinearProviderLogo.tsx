const LinearSVG = () => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect width='24' height='24' rx='4' fill='#5E6AD2' /> {/* Placeholder color */}
    <text
      x='50%'
      y='50%'
      dominantBaseline='middle'
      textAnchor='middle'
      fill='white'
      fontSize='10'
      fontWeight='bold'
    >
      LI
    </text>{' '}
    {/* Placeholder text */}
  </svg>
)

const LinearProviderLogo = () => {
  return (
    <div className='mr-4 flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-sm'>
      <LinearSVG />
    </div>
  )
}

export default LinearProviderLogo
