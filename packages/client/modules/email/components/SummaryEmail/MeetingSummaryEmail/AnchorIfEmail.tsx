import {Link} from '@tanstack/react-router'
import type {ReactNode} from 'react'
import hrefOptions from '~/routing/hrefOptions'

interface Props {
  isDemo?: boolean
  isEmail: boolean
  href: string
  title?: string
  style?: any
  children?: ReactNode
}

const AnchorIfEmail = (props: Props) => {
  const {isDemo, isEmail, href, ...aProps} = props
  return isDemo ? (
    <span {...aProps} />
  ) : isEmail ? (
    <a href={href} {...aProps} />
  ) : (
    <Link {...hrefOptions(href)} {...aProps} />
  )
}

export default AnchorIfEmail
