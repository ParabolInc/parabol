import React from 'react'

// Can multiply 24(n) for standard MD sizes eg. 24(2) = 48

const AzureDevOpsSVG = React.memo(() => {
  return (
    <svg width='24' height='24' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <defs>
        <linearGradient id='a' x1='9' y1='16.97' x2='9' y2='1.03' gradientUnits='userSpaceOnUse'>
          <stop offset='0' stopColor='#0078d4' />
          <stop offset='.16' stopColor='#1380da' />
          <stop offset='.53' stopColor='#3c91e5' />
          <stop offset='.82' stopColor='#559cec' />
          <stop offset='1' stopColor='#5ea0ef' />
        </linearGradient>
      </defs>
      <path
        d='M17 4v9.74l-4 3.28-6.2-2.26V17l-3.51-4.59 10.23.8V4.44zm-3.41.49L7.85 1v2.29L2.58 4.84 1 6.87v4.61l2.26 1V6.57z'
        fill='url(#a)'
      />
    </svg>
  )
})

export default AzureDevOpsSVG
