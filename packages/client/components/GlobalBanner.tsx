import clsx from 'clsx'
import React from 'react'

interface Props {
  bgColor: string
  color: string
  text: string
}

// https://www.astrouxds.com/components/classification-markings/#banner-examples

// Note: banner height is 24px per Tailwind settings (h-6, leading-6)
// This height value is also in constEnums GlobalBanner

const GlobalBanner = (props: Props) => {
  const {bgColor, color, text} = props
  return (
    <div
      className={clsx(
        'bg-jade-600',
        'block',
        'font-bold',
        'h-6',
        'leading-6',
        'text-center',
        'text-white',
        'uppercase',
        'w-full',
        'fixed',
        'z-50'
      )}
      style={{
        backgroundColor: bgColor,
        color
      }}
    >
      {text}
    </div>
  )
}

export default GlobalBanner
