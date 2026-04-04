import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {PokerEstimateHeaderCardParabol_task$key} from '../__generated__/PokerEstimateHeaderCardParabol_task.graphql'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint} from '../types/constEnums'
import CardButton from './CardButton'
import IconLabel from './IconLabel'
import PokerEstimateHeaderCardEditable from './PokerEstimateHeaderCardEditable'

interface Props {
  task: PokerEstimateHeaderCardParabol_task$key
}

const PokerEstimateHeaderCardParabol = (props: Props) => {
  const {task: taskRef} = props
  const task = useFragment(
    graphql`
      fragment PokerEstimateHeaderCardParabol_task on Task {
        id
        content
        teamId
      }
    `,
    taskRef
  )
  const {id: taskId, content, teamId} = task
  const [isExpanded, setIsExpanded] = useState(true)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const toggleExpand = () => {
    setIsExpanded((isExpanded) => !isExpanded)
  }

  return (
    <div className={`flex ${isDesktop ? 'px-4 pb-1' : 'px-2 pb-1'}`}>
      <div
        className='relative mx-auto flex w-full items-start rounded bg-white p-3 pl-4 shadow-md'
        style={{maxWidth: '1504px'}}
      >
        <div className='flex-1 pr-1'>
          <div
            className={`m-0 font-normal text-slate-700 text-sm leading-5 transition-all duration-300 ${
              isExpanded ? 'overflow-y-auto' : 'overflow-y-hidden'
            }`}
            style={{maxHeight: isExpanded ? '300px' : '38px'}}
          >
            <PokerEstimateHeaderCardEditable taskId={taskId} teamId={teamId} content={content} />
          </div>
        </div>
        <div className='flex items-center'>
          <CardButton>
            <IconLabel icon='unfold_more' onClick={toggleExpand} />
          </CardButton>
        </div>
      </div>
    </div>
  )
}

export default PokerEstimateHeaderCardParabol
