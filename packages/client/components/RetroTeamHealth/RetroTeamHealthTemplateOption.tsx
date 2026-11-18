import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroTeamHealthTemplateOption_template$key} from '~/__generated__/RetroTeamHealthTemplateOption_template.graphql'
import {cn} from '../../ui/cn'

interface Props {
  template: RetroTeamHealthTemplateOption_template$key
  isSelected: boolean
  isDefault: boolean
  onSelect: () => void
}

const RetroTeamHealthTemplateOption = (props: Props) => {
  const {template: templateRef, isSelected, isDefault, onSelect} = props
  const template = useFragment(
    graphql`
      fragment RetroTeamHealthTemplateOption_template on MeetingTemplate {
        name
        ... on TeamHealthTemplate {
          questions {
            category {
              id
            }
          }
        }
      }
    `,
    templateRef
  )
  const {name, questions} = template
  const questionCount = new Set(questions?.map(({category}) => category.id)).size
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg border-2 px-3 py-2.5',
        isSelected ? 'border-accent bg-surface-raised' : 'border-hairline'
      )}
    >
      <input
        type='radio'
        name='retro-team-health-template'
        checked={isSelected}
        onChange={onSelect}
        className='m-0 size-4 shrink-0 accent-sky-600'
      />
      <span className='flex min-w-0 flex-1 flex-wrap items-center gap-2'>
        <span className='font-semibold text-fg-primary'>{name}</span>
        {isDefault && (
          <span className='rounded-full border border-hairline-strong px-2 font-semibold text-fg-secondary text-xs'>
            Default
          </span>
        )}
      </span>
      <span className='shrink-0 font-semibold text-fg-secondary text-sm'>{`${questionCount} questions`}</span>
    </label>
  )
}

export default RetroTeamHealthTemplateOption
