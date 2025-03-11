import HistoryIcon from '@mui/icons-material/History'
import type {NodeViewProps} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useRef} from 'react'
import {usePreloadedQuery, type PreloadedQuery} from 'react-relay'
import {Menu} from '~/ui/Menu/Menu'
import {MenuContent} from '~/ui/Menu/MenuContent'
import {MenuItem} from '~/ui/Menu/MenuItem'
import type {InsightsBlockPromptQuery} from '../../../__generated__/InsightsBlockPromptQuery.graphql'
import type {InsightsBlockAttrs} from './InsightsBlock'

const query = graphql`
  query InsightsBlockPromptQuery {
    viewer {
      aiPrompts {
        id
        content
        isUserDefined
        lastUsedAt
      }
    }
  }
`

interface Props {
  updateAttributes: NodeViewProps['updateAttributes']
  attrs: InsightsBlockAttrs
  queryRef: PreloadedQuery<InsightsBlockPromptQuery>
}

export const InsightsBlockPrompt = (props: Props) => {
  const {attrs, queryRef, updateAttributes} = props
  const data = usePreloadedQuery<InsightsBlockPromptQuery>(query, queryRef)
  const {viewer} = data
  const {aiPrompts} = viewer
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const {prompt} = attrs
  const defaultValue = prompt || aiPrompts[0]?.content || ''
  return (
    <div>
      <h3 className='pt-2'>What do you want to know?</h3>
      <div className='relative w-full'>
        <div className='absolute top-0 right-0'>
          <Menu
            trigger={
              <button className='bg-inherit p-1'>
                <HistoryIcon className='cursor-pointer' />
              </button>
            }
          >
            <MenuContent align='end' sideOffset={4}>
              {aiPrompts.map((prompt) => {
                const {id, lastUsedAt, content} = prompt
                return (
                  <MenuItem
                    key={id}
                    onClick={() => {
                      textAreaRef.current!.value = content
                    }}
                    className='w-80 flex-col items-start justify-start'
                  >
                    <div className='w-72 overflow-hidden text-ellipsis whitespace-nowrap'>
                      {content.slice(0, 80)}
                    </div>
                    <div className='text-xs font-bold text-slate-600'>{`Last used: ${dayjs(lastUsedAt).format('ddd MMM D')}`}</div>
                    {}
                  </MenuItem>
                )
              })}
            </MenuContent>
          </Menu>
        </div>
        <textarea
          defaultValue={defaultValue}
          autoComplete='on'
          autoCorrect='on'
          spellCheck={true}
          minLength={10}
          placeholder={'Summarize the meeting data and extract key insights...'}
          ref={textAreaRef}
          rows={13}
          cols={30}
          onChange={(e) => {
            updateAttributes({prompt: e.target.value})
          }}
          className='max-h-96 min-h-14 w-full resize-y rounded-md pr-6 outline-hidden focus:ring-2'
        ></textarea>
      </div>
    </div>
  )
}
