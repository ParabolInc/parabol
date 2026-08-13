import type {CSSProperties} from 'react'
import logo from '../styles/theme/images/graphics/github-flat.svg'
import logoWhite from '../styles/theme/images/graphics/github-flat-white.svg'
import {cn} from '../ui/cn'

type Props = {
  className?: string
}

const GitHubProviderLogo = (props: Props) => {
  const {className} = props
  return (
    <div
      className={cn(
        'h-12 w-12 bg-[image:var(--logo)] bg-contain bg-no-repeat dark:bg-[image:var(--logo-dark)]',
        className
      )}
      style={
        {
          '--logo': `url("${logo}")`,
          '--logo-dark': `url("${logoWhite}")`
        } as CSSProperties
      }
    />
  )
}

export default GitHubProviderLogo
