import clsx from 'clsx'
import React from 'react'

interface Props {
  style: object
  text: string
}

// https://www.astrouxds.com/components/classification-markings/#banner-examples

const SecurityBanner = (props: Props) => {
  const {text, style} = props
  return (
    <div
      className={clsx(
        'bg-jade-600',
        'block',
        'font-bold',
        'leading-6',
        'text-center',
        'text-white',
        'uppercase',
        'w-full'
      )}
      style={style}
    >
      {text}
    </div>
  )
}

export default SecurityBanner
