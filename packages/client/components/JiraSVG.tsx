import {memo} from 'react'

interface Props {
  className?: string
}

const JiraSVG = memo(({className}: Props) => {
  return (
    <svg
      className={className}
      width='24'
      height='24'
      viewBox='2.78 3.89 17.79 17.79'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        className='dark:fill-[#669DF1]'
        d='M9.051 15.434H7.734c-1.988 0-3.413-1.218-3.413-3h7.085c.367 0 .605.26.605.63v7.13c-1.772 0-2.96-1.435-2.96-3.434zm3.5-3.543h-1.318c-1.987 0-3.413-1.196-3.413-2.978h7.085c.367 0 .627.239.627.608v7.13c-1.772 0-2.981-1.435-2.981-3.434zm3.52-3.522h-1.317c-1.987 0-3.413-1.217-3.413-3h7.085c.367 0 .605.262.605.61v7.129c-1.771 0-2.96-1.435-2.96-3.434z'
        fill='#1868DB'
      />
    </svg>
  )
})

export default JiraSVG
