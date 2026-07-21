import type {ReactNode} from 'react'

interface Props {
  children: ReactNode
}

const LightIsland = (props: Props) => {
  const {children} = props
  return <div className='light-island contents'>{children}</div>
}

export default LightIsland
