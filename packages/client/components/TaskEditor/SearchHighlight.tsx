import {ReactNode} from 'react'
import {PALETTE} from '../../styles/paletteV3'

const style = {
  backgroundColor: PALETTE.GOLD_HIGHLIGHT,
  borderRadius: 2
}

interface Props {
  children: ReactNode
  offsetkey: string
}

const SearchHighlight = (props: Props) => {
  const {offsetkey, children} = props
  return (
    <span data-offset-key={offsetkey} style={style}>
      {children}
    </span>
  )
}

export default SearchHighlight
