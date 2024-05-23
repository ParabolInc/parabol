import clsx from 'clsx'
import React from 'react'

interface Props {
  level: 0 | 1 | 2 | 3 | 4 | 5
  style: object
  text: string
}

// Level 0: Unclassified
// Level 1: Controlled (CUI)
// Level 2: Confidential
// Level 3: Secret
// Level 4: Top Secret
// Level 5: Top Secret/SCI

// See tailwindTheme.ts for security color theme
// https://www.astrouxds.com/components/classification-markings/#banner-examples
// These classes are on the ‘safelist’ to force loading
// them when not used explicity, see tailwind.config.js

// Note: text and style props will override level defaults

const SecurityBanner = (props: Props) => {
  const {level, text, style} = props
  const labels = [
    'Unclassified',
    'Controlled (CUI)',
    'Confidential',
    'Secret',
    'Top Secret',
    'Top Secret/SCI'
  ]
  return (
    <div
      className={clsx(
        `bg-security-${level}`,
        'block',
        'font-bold',
        'leading-6',
        'text-center',
        `${level === 4 || level === 5 ? 'text-black' : 'text-white'}`,
        'uppercase',
        'w-full'
      )}
      style={style}
    >
      {text ? text : labels[level]}
    </div>
  )
}

export default SecurityBanner
