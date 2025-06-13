import {twStyled} from '../../ui/twStyled'
import PlainButton from '../PlainButton/PlainButton'

const ReflectionCardButton = twStyled(PlainButton)(
  'flex h-6 w-6 shrink-0 items-center justify-center justify-self-end rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500'
)

export default ReflectionCardButton
