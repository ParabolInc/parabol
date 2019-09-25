import React, {ReactNode} from 'react'
import {PALETTE} from '../../styles/paletteV2'

const style = {
  backgroundColor: PALETTE.BACKGROUND_USER_MENTION,
  borderRadius: 2,
  fontWeight: 600
}

interface Props {
  children: ReactNode
  offsetkey: string
}

const Mention = (props: Props) => {
  const {offsetkey, children} = props
  return (
    <span data-offset-key={offsetkey} style={style}>
      {children}
    </span>
  )
}

export default Mention
