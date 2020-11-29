import {ReflectionGroupTitleEditor_meeting} from '../../__generated__/ReflectionGroupTitleEditor_meeting.graphql'
import {ReflectionGroupTitleEditor_reflectionGroup} from '../../__generated__/ReflectionGroupTitleEditor_reflectionGroup.graphql'
/**
 * Edits the name of a reflection group.
 *
 */
import React, {Component, RefObject} from 'react'
import styled from '@emotion/styled'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import StyledError from '../StyledError'
import withAtmosphere, {WithAtmosphereProps} from '../../decorators/withAtmosphere/withAtmosphere'
import UpdateReflectionGroupTitleMutation from '../../mutations/UpdateReflectionGroupTitleMutation'
import {PALETTE} from '../../styles/paletteV2'
import ui from '../../styles/ui'
import {Card} from '../../types/constEnums'
import {RETRO_TOPIC_LABEL} from '../../utils/constants'
import withMutationProps, {WithMutationProps} from '../../utils/relay/withMutationProps'

interface Props extends WithMutationProps, WithAtmosphereProps {
  isExpanded: boolean
  reflectionGroup: ReflectionGroupTitleEditor_reflectionGroup
  readOnly: boolean
  meeting: ReflectionGroupTitleEditor_meeting
  titleInputRef: RefObject<HTMLInputElement>
}

const fontSize = Card.FONT_SIZE
const lineHeight = Card.LINE_HEIGHT

const underlineStyles = {
  backgroundColor: 'transparent',
  borderLeftColor: 'transparent !important',
  borderRightColor: 'transparent !important',
  borderTopColor: 'transparent !important',
  boxShadow: 'none !important'
} as any

const InputWithIconWrap = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const RootBlock = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 1,
  maxWidth: '100%'
})

const FormBlock = styled('form')({
  display: 'flex',
  flexShrink: 1,
  maxWidth: '100%'
})

// This is gonna turn into slate, no use in spending time fixing it now
const NameInput = styled('input')<{isExpanded: boolean; readOnly: boolean}>(
  ({isExpanded, readOnly}) => ({
    ...underlineStyles,
    ':hover,:focus,:active': {
      underlineStyles
    },
    ...ui.fieldBaseStyles,
    ...ui.fieldSizeStyles.small,
    border: 0,
    boxShadow: 'none',
    color: isExpanded ? '#FFFFFF' : PALETTE.TEXT_MAIN,
    cursor: readOnly ? 'default' : 'text',
    fontSize,
    fontWeight: 600,
    lineHeight,
    padding: 0,
    // need to use a content editable if we wanna animate this since input el forces width
    // card width is set at REFLECTION_WIDTH, so this can be a PX, too
    textAlign: 'left',
    width: 172,
    transition: 'all 200ms'
  })
)

const getValidationError = (title: string | null, reflectionGroups, reflectionGroupId) => {
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

class ReflectionGroupTitleEditor extends Component<Props> {
  initialTitle: string

  constructor(props: Props) {
    super(props)
    this.initialTitle = props.reflectionGroup.title || ''
  }

  onChange = (e) => {
    const {
      atmosphere,
      dirty,
      error,
      onCompleted,
      onError,
      meeting: {reflectionGroups},
      reflectionGroup: {id: reflectionGroupId}
    } = this.props
    const title = e.target.value
    commitLocalUpdate(atmosphere, (store) => {
      const reflectionGroup = store.get(reflectionGroupId)
      if (!reflectionGroup) return
      reflectionGroup.setValue(title, 'title')
    })
    if (dirty) {
      const normalizedTitle = title.trim()
      const validationError = getValidationError(
        normalizedTitle,
        reflectionGroups,
        reflectionGroupId
      )
      if (!validationError) {
        if (error) {
          onCompleted()
        }
      } else {
        onError({message: validationError})
      }
    }
  }

  onClick = () => {
    const {titleInputRef} = this.props
    titleInputRef.current && titleInputRef.current.select()
  }

  onSubmit = (e) => {
    e.preventDefault()
    const {
      atmosphere,
      setDirty,
      submitting,
      submitMutation,
      onCompleted,
      onError,
      meeting: {reflectionGroups},
      reflectionGroup: {id: reflectionGroupId, title}
    } = this.props
    if (submitting || title === this.initialTitle || !title) return
    this.initialTitle = title
    // validate
    setDirty()
    const normalizedTitle = title.trim()
    const validationError = getValidationError(normalizedTitle, reflectionGroups, reflectionGroupId)
    if (validationError) {
      onError({message: validationError})
      return
    }

    submitMutation()
    UpdateReflectionGroupTitleMutation(
      atmosphere,
      {title: normalizedTitle, reflectionGroupId},
      {onError, onCompleted}
    )
  }

  render() {
    const {
      isExpanded,
      error,
      readOnly,
      reflectionGroup: {title},
      titleInputRef
    } = this.props
    return (
      <InputWithIconWrap>
        <RootBlock data-cy='group-title-editor'>
          <FormBlock onSubmit={this.onSubmit}>
            <NameInput
              data-cy='group-title-editor-input'
              isExpanded={isExpanded}
              onBlur={this.onSubmit}
              onChange={this.onChange}
              placeholder={RETRO_TOPIC_LABEL}
              readOnly={readOnly}
              ref={titleInputRef}
              size={20}
              type='text'
              value={title || ''}
            />
          </FormBlock>
          {error && <StyledError>{error}</StyledError>}
        </RootBlock>
      </InputWithIconWrap>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(ReflectionGroupTitleEditor)),
  {
    reflectionGroup: graphql`
      fragment ReflectionGroupTitleEditor_reflectionGroup on RetroReflectionGroup {
        id
        title
      }
    `,
    meeting: graphql`
      fragment ReflectionGroupTitleEditor_meeting on RetrospectiveMeeting {
        reflectionGroups {
          id
          title
        }
      }
    `
  }
)
