import {Link} from 'react-router-dom'
import React, {ReactNode} from 'react'

interface Props {
  isEmail: boolean
  href: string
  title?: string
  style?: any
  children?: ReactNode
}

const AnchorIfEmail = (props: Props) => {
  const {isEmail, href, ...aProps} = props
  return isEmail ? <a href={href} {...aProps} /> : <Link to={href} {...aProps} />
}

export default AnchorIfEmail
