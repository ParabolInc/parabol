import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroTemplatePromptList_template$key} from '../../__generated__/RetroTemplatePromptList_template.graphql'
import RetroTemplateMatchText from './RetroTemplateMatchText'

interface Props {
  templateRef: RetroTemplatePromptList_template$key
  searchQuery: string
}

const RetroTemplatePromptList = ({templateRef, searchQuery}: Props) => {
  const template = useFragment(
    graphql`
      fragment RetroTemplatePromptList_template on MeetingTemplate {
        name
        ... on PromptTemplate {
          prompts {
            id
            question
            description
            groupColor
          }
        }
      }
    `,
    templateRef
  )
  return (
    <ol
      aria-label={`${template.name} prompts`}
      className='mx-3 mt-0 mb-3 flex list-none flex-col gap-3 border-hairline border-t px-0 pt-3 pb-0'
    >
      {(template.prompts ?? []).map(({id, question, description, groupColor}) => (
        <li key={id} className='grid grid-cols-[10px_minmax(0,1fr)] items-start gap-x-2.5'>
          <span
            aria-hidden
            className='mt-[5px] size-2.5 rounded-full'
            style={{backgroundColor: groupColor}}
          />
          <span className='flex flex-col gap-0.5'>
            <span className='font-semibold text-fg-primary text-sm'>
              <RetroTemplateMatchText text={question} searchQuery={searchQuery} />
            </span>
            {description && (
              <span className='text-[13px] text-fg-secondary leading-[18px]'>
                <RetroTemplateMatchText text={description} searchQuery={searchQuery} />
              </span>
            )}
          </span>
        </li>
      ))}
    </ol>
  )
}

export default RetroTemplatePromptList
