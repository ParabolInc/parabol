import {twStyled} from '../../ui/twStyled'
import PlainButton from '../PlainButton/PlainButton'

const ReflectionCardButton = twStyled(PlainButton)(
  'flex h-6 w-6 shrink-0 items-center justify-center justify-self-end rounded-full bg-surface-well text-fg-primary hover:bg-surface-hover disabled:cursor-not-allowed disabled:bg-surface-well disabled:opacity-50'
)

export default ReflectionCardButton
