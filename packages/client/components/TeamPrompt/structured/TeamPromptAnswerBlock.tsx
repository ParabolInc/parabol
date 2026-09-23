import type {JSONContent} from '@tiptap/react'
import {useMemo} from 'react'
import {cn} from '../../../ui/cn'
import PromptResponseEditor from '../PromptResponseEditor'

interface Props {
  teamId: string
  prompt: {id: string; question: string; groupColor: string}
  content: string
  showLabel?: boolean
  textClassName?: string
}

const TeamPromptAnswerBlock = (props: Props) => {
  const {
    teamId,
    prompt,
    content,
    showLabel = true,
    textClassName = 'pl-[18px] text-sm leading-6'
  } = props
  const doc: JSONContent = useMemo(() => JSON.parse(content), [content])
  return (
    <div className='flex flex-col gap-1'>
      {showLabel && (
        <div className='flex items-center gap-2 font-semibold text-[13px] text-fg-secondary'>
          <span
            className='h-2.5 w-2.5 shrink-0 rounded-full'
            style={{background: prompt.groupColor}}
          />
          {prompt.question}
        </div>
      )}
      <PromptResponseEditor
        teamId={teamId}
        content={doc}
        readOnly
        showActions={false}
        className={cn(textClassName, '[&_ol]:pl-5 [&_ul]:pl-5')}
      />
    </div>
  )
}

export default TeamPromptAnswerBlock
