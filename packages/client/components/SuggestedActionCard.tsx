import {Cancel, ChangeHistory, GroupAdd, GroupWork, History, PersonAdd} from '@mui/icons-material'
import type {ReactNode} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import DismissSuggestedActionMutation from '../mutations/DismissSuggestedActionMutation'
import PlainButton from './PlainButton/PlainButton'
import SuggestedActionBackground from './SuggestedActionBackground'

interface Props {
  backgroundColor: string
  children: ReactNode
  //FIXME 6062: change to React.ComponentType
  iconName: string
  suggestedActionId: string
}

const SuggestedActionCard = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onCompleted, onError} = useMutationProps()
  const onCancel = () => {
    const {suggestedActionId} = props
    if (submitting) return
    submitMutation()
    DismissSuggestedActionMutation(atmosphere, {suggestedActionId}, {onError, onCompleted})
  }

  const {backgroundColor, children, iconName} = props
  return (
    <div className='relative flex w-full animate-[scale-in_300ms_cubic-bezier(0,0,.2,1)] flex-col items-center overflow-hidden rounded bg-surface-card shadow-[var(--shadow-card)]'>
      <SuggestedActionBackground backgroundColor={backgroundColor} />
      {children}
      <PlainButton onClick={onCancel}>
        <Cancel className='absolute top-2 right-2 rounded-full bg-white/80 text-slate-700 opacity-70 hover:opacity-100' />
      </PlainButton>
      <div className='absolute top-[100px] h-9 w-9 select-none rounded-full bg-slate-300 p-2 text-grape-700 shadow-[0px_3px_1px_-2px_rgba(0,0,0,.2),0px_2px_2px_0px_rgba(0,0,0,.14),0px_1px_5px_0px_rgba(0,0,0,.12)] [&_svg]:text-[20px]'>
        {
          {
            group_add: <GroupAdd />,
            person_add: <PersonAdd />,
            change_history: <ChangeHistory />,
            history: <History />,
            group_work: <GroupWork />
          }[iconName]
        }
      </div>
    </div>
  )
}

export default SuggestedActionCard
