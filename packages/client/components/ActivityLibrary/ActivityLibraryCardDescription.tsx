import * as ScrollArea from '@radix-ui/react-scroll-area'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import {
  ActivityLibraryCardDescription_template$data,
  ActivityLibraryCardDescription_template$key
} from '~/__generated__/ActivityLibraryCardDescription_template.graphql'

import {Comment, LinearScale, Update} from '@mui/icons-material'
import {useFragment} from 'react-relay'

interface RetroDescriptionProps {
  prompts: ActivityLibraryCardDescription_template$data['prompts']
}

export const RetroDescription = (props: RetroDescriptionProps) => {
  const {prompts} = props
  return (
    <>
      {prompts!.map((prompt) => (
        <div key={prompt.id} className='mb-1 flex flex-col items-start py-1 sm:flex-row'>
          <div
            className='mt-1 mr-4 h-3 w-3 shrink-0 self-start rounded-full'
            style={{backgroundColor: prompt.groupColor}}
          />
          <div className='flex min-w-0 grow flex-col'>
            <div className='text-sm font-semibold'>{prompt.question}</div>
            <div className='text-sm font-normal'>{prompt.description}</div>
          </div>
        </div>
      ))}
    </>
  )
}

interface PokerDescriptionProps {
  dimensions: ActivityLibraryCardDescription_template$data['dimensions']
}

const PokerDescription = (props: PokerDescriptionProps) => {
  const {dimensions} = props
  return (
    <>
      {dimensions!.map((dimension) => (
        <div key={dimension.id} className='mb-1 flex items-center py-1 sm:flex-row'>
          <div className='mr-4 shrink-0 self-start'>
            <LinearScale className='h-4 w-4' />
          </div>
          <div className='flex min-w-0 grow flex-col'>
            <div className='text-sm font-semibold'>{dimension.name}</div>
            <div className='text-sm font-normal'>{dimension.selectedScale.name}</div>
          </div>
        </div>
      ))}
    </>
  )
}

const ActionDescription = () => {
  const items = [
    {
      icon: <Update className='h-5 w-5' />,
      description: 'Solo Updates'
    },
    {
      icon: <Comment className='h-5 w-5' />,
      description: 'Team Agenda'
    }
  ]

  return (
    <>
      {items.map((item, index) => (
        <div key={index} className='mb-1 flex items-start py-1 sm:flex-row'>
          <div className='mr-4 flex shrink-0 items-center self-start'>{item.icon}</div>
          <div className='flex min-w-0 grow flex-col'>
            <div className='text-sm font-normal'>{item.description}</div>
          </div>
        </div>
      ))}
    </>
  )
}

const TeamPromptDescription = () => {
  const items = [
    {
      icon: <Comment className='h-5 w-5' />,
      description: 'What are you working on today? Stuck on anything?'
    }
  ]

  return (
    <>
      {items.map((item, index) => (
        <div key={index} className='mb-1 flex items-start py-1 sm:flex-row'>
          <div className='mr-4 flex shrink-0 items-center self-start'>{item.icon}</div>
          <div className='flex min-w-0 grow flex-col'>
            <div className='text-sm font-normal'>{item.description}</div>
          </div>
        </div>
      ))}
    </>
  )
}

interface Props {
  className?: string
  templateRef: ActivityLibraryCardDescription_template$key
}

export const ActivityLibraryCardDescription = (props: Props) => {
  const {className, templateRef} = props

  const template = useFragment(
    graphql`
      fragment ActivityLibraryCardDescription_template on MeetingTemplate {
        type
        ... on PokerTemplate {
          dimensions {
            id
            name
            description
            selectedScale {
              name
            }
          }
        }
        ... on ReflectTemplate {
          prompts {
            id
            question
            groupColor
            description
          }
        }
      }
    `,
    templateRef
  )

  return (
    <ScrollArea.Root className={clsx('flex-1 overflow-auto', className)}>
      <ScrollArea.Viewport>
        <div className='flex flex-1 flex-col gap-y-1 px-2 py-1 text-slate-900'>
          {template.type === 'retrospective' && <RetroDescription prompts={template.prompts} />}
          {template.type === 'poker' && <PokerDescription dimensions={template.dimensions} />}
          {template.type === 'action' && <ActionDescription />}
          {template.type === 'teamPrompt' && <TeamPromptDescription />}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation='vertical' className='hidden' />
    </ScrollArea.Root>
  )
}
