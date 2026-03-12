import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {type RefObject, useRef, useState} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {ReflectionGroupTitleEditor_meeting$key} from '../../__generated__/ReflectionGroupTitleEditor_meeting.graphql'
import type {ReflectionGroupTitleEditor_reflectionGroup$key} from '../../__generated__/ReflectionGroupTitleEditor_reflectionGroup.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import UpdateReflectionGroupTitleMutation from '../../mutations/UpdateReflectionGroupTitleMutation'
import {cn} from '../../ui/cn'
import {RETRO_TOPIC_LABEL} from '../../utils/constants'
import StyledError from '../StyledError'
import MarqueeText from './MarqueeText'

interface Props {
  isExpanded: boolean
  reflectionGroup: ReflectionGroupTitleEditor_reflectionGroup$key
  readOnly: boolean
  meeting: ReflectionGroupTitleEditor_meeting$key
  titleInputRef: RefObject<HTMLInputElement>
}

const getValidationError = (
  title: string | null,
  reflectionGroups: readonly {id: string; title: string | null | undefined}[],
  reflectionGroupId: string
) => {
  if (!title || title.length < 1) {
    return 'Enter a title'
  }
  const usedTitles = reflectionGroups
    .filter((group) => group.id !== reflectionGroupId)
    .map((group) => group.title)
  if (usedTitles.includes(title)) {
    return 'You already used that name'
  }
  return undefined
}

const ReflectionGroupTitleEditor = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {submitMutation, submitting, onCompleted, onError, error} = useMutationProps()
  const {
    meeting: meetingRef,
    reflectionGroup: reflectionGroupRef,
    titleInputRef,
    isExpanded,
    readOnly
  } = props
  const reflectionGroup = useFragment(
    graphql`
      fragment ReflectionGroupTitleEditor_reflectionGroup on RetroReflectionGroup {
        id
        title
      }
    `,
    reflectionGroupRef
  )
  const meeting = useFragment(
    graphql`
      fragment ReflectionGroupTitleEditor_meeting on RetrospectiveMeeting {
        reflectionGroups {
          id
          title
        }
      }
    `,
    meetingRef
  )
  const {reflectionGroups} = meeting
  const {id: reflectionGroupId, title} = reflectionGroup
  const dirtyRef = useRef(false)
  const initialTitleRef = useRef(title)
  const [isEditing, setIsEditing] = useState(false)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    commitLocalUpdate(atmosphere, (store) => {
      const reflectionGroup = store.get(reflectionGroupId)
      if (!reflectionGroup) return
      reflectionGroup.setValue(title, 'title')
    })
    if (!dirtyRef.current) return
    const normalizedTitle = title.trim()
    const validationError = getValidationError(normalizedTitle, reflectionGroups, reflectionGroupId)
    if (!validationError) {
      if (error) {
        onCompleted()
      }
    } else {
      onError(new Error(validationError))
    }
  }

  const onSubmit = (e: React.FormEvent<HTMLInputElement | HTMLFormElement>) => {
    e.preventDefault()
    setIsEditing(false)
    if (submitting || title === initialTitleRef.current || !title) return
    initialTitleRef.current = title
    // validate
    dirtyRef.current = true
    const normalizedTitle = title.trim()
    const validationError = getValidationError(normalizedTitle, reflectionGroups, reflectionGroupId)
    if (validationError) {
      onError(new Error(validationError))
      return
    }
    titleInputRef.current?.blur()
    submitMutation()
    UpdateReflectionGroupTitleMutation(
      atmosphere,
      {title: normalizedTitle, reflectionGroupId},
      {onError, onCompleted}
    )
  }

  const onKeyPress = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    onSubmit(e as any)
  }

  return (
    <div className='flex items-center'>
      <div className='flex max-w-full shrink flex-col' data-cy='group-title-editor'>
        <form className='flex max-w-full shrink' onSubmit={onSubmit}>
          <div className='relative w-[172px]'>
            {!isEditing && (
              <MarqueeText
                title={title || ''}
                isExpanded={isExpanded}
                readOnly={readOnly}
                onActivateEdit={() => {
                  setIsEditing(true)
                  titleInputRef.current?.select()
                }}
              />
            )}
            <input
              data-cy='group-title-editor-input'
              className={cn(
                'm-0 block w-[172px] appearance-none rounded-sm border-0 font-sans outline-0',
                'px-[.4375rem] py-[.3125rem] text-sm leading-5',
                'bg-transparent p-0 text-left font-semibold shadow-none transition-all duration-200',
                isExpanded ? 'text-white' : 'text-slate-700',
                readOnly ? 'cursor-default' : 'cursor-text'
              )}
              onBlur={onSubmit}
              onChange={onChange}
              onFocus={() => setIsEditing(true)}
              onKeyPress={onKeyPress}
              placeholder={RETRO_TOPIC_LABEL}
              readOnly={readOnly}
              ref={titleInputRef}
              maxLength={200}
              type='text'
              value={title || ''}
              style={!isEditing ? {opacity: 0} : undefined}
            />
          </div>
        </form>
        {error && <StyledError>{error.message}</StyledError>}
      </div>
    </div>
  )
}

export default ReflectionGroupTitleEditor
