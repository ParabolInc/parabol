import React from 'react'
import logo from '../styles/theme/images/graphics/zoom-logo.svg'

const ZoomProviderLogo = () => {
  return (
    <div
      className='h-6 w-6 bg-contain bg-no-repeat'
      style={{backgroundImage: `url(${logo})`}}
    ></div>
  )
}

export default ZoomProviderLogo
