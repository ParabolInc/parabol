import type {JSONContent} from '@tiptap/core'
import {useState} from 'react'
import {Add, Check} from '~/ui/icons'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import CreateReflectionMutation from '../../../mutations/CreateReflectionMutation'
import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../ui/Menu/MenuItem'
import menuSectionTitleClass from '../../../ui/Menu/menuSectionTitleClass'
import {useWorkDrawerConsume} from './WorkDrawerConsumeContext'

interface Props {
  subject: string
  content: JSONContent
}

const RetroStartReflectionMenu = (props: Props) => {
  const {subject, content} = props
  const atmosphere = useAtmosphere()
  const {meetingId, reflectPrompts, getNextReflectionSortOrder} = useWorkDrawerConsume()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const [startedIn, setStartedIn] = useState<string | null>(null)

  const startReflection = (promptId: string, question: string) => {
    if (submitting) return
    submitMutation()
    const input = {
      content: JSON.stringify(content),
      meetingId,
      promptId,
      sortOrder: getNextReflectionSortOrder(promptId)
    }
    CreateReflectionMutation(
      atmosphere,
      {input},
      {
        onError,
        onCompleted: (res, errors) => {
          onCompleted(res, errors)
          if (!errors) setStartedIn(question)
        }
      }
    )
  }

  return (
    <Menu
      trigger={
        <Button
          variant='outline'
          shape='icon'
          disabled={submitting}
          aria-label={
            startedIn
              ? `Started a reflection about ${subject} in ${startedIn}. Start another`
              : `Start a reflection about ${subject}`
          }
          className={cn(
            'size-8 p-0 text-fg-secondary data-[state=open]:border-accent',
            startedIn && 'text-fg-primary'
          )}
        >
          {startedIn ? <Check className='size-4' /> : <Add className='size-4' />}
        </Button>
      }
    >
      <MenuContent align='end'>
        <div className={menuSectionTitleClass}>Start a reflection in</div>
        {reflectPrompts.map(({id, question, groupColor}) => (
          <MenuItem key={id} onSelect={() => startReflection(id, question)}>
            <span
              className='mr-2 size-2.5 shrink-0 rounded-full'
              style={{backgroundColor: groupColor}}
            />
            {question}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  )
}

export default RetroStartReflectionMenu
