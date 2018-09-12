import {ReflectionGroupTitleEditor_meeting} from '__generated__/ReflectionGroupTitleEditor_meeting.graphql'
import {ReflectionGroupTitleEditor_reflectionGroup} from '__generated__/ReflectionGroupTitleEditor_reflectionGroup.graphql'
/**
 * Edits the name of a reflection group.
 *
 */
import React, {Component} from 'react'
import styled from 'react-emotion'
import reactLifecyclesCompat from 'react-lifecycles-compat'
import {commitLocalUpdate, createFragmentContainer, graphql} from 'react-relay'
import StyledError from 'universal/components/StyledError'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import UpdateReflectionGroupTitleMutation from 'universal/mutations/UpdateReflectionGroupTitleMutation'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import {RETRO_TOPIC_LABEL} from 'universal/utils/constants'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props extends WithMutationProps, WithAtmosphereProps {
  isExpanded: boolean
  reflectionGroup: ReflectionGroupTitleEditor_reflectionGroup
  readOnly: boolean
  meeting: ReflectionGroupTitleEditor_meeting
}

const fontSize = appTheme.typography.s3
const lineHeight = appTheme.typography.s5

const underlineStyles = {
  backgroundColor: 'transparent',
  borderLeftColor: 'transparent !important',
  borderRightColor: 'transparent !important',
  borderTopColor: 'transparent !important',
  boxShadow: 'none !important'
}

const PencilIcon = styled(StyledFontAwesome)(({isExpanded}: {isExpanded?: boolean}) => ({
  color: isExpanded ? '#fff' : ui.hintColor,
  height: ui.iconSize,
  lineHeight,
  opacity: 0.5,
  paddingLeft: '0.25rem',
  textAlign: 'center',
  top: '-.0625rem',
  width: ui.iconSize
}))

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
const NameInput = styled('input')(
  ({isExpanded, readOnly}: {isExpanded: boolean; readOnly: boolean}) => ({
    ...underlineStyles,
    ':hover,:focus,:active': {
      underlineStyles
    },
    ...ui.fieldBaseStyles,
    ...ui.fieldSizeStyles.small,
    border: 0,
    boxShadow: 'none',
    color: isExpanded ? '#fff' : appTheme.palette.dark,
    cursor: readOnly ? 'default' : 'text',
    fontSize,
    fontWeight: 600,
    lineHeight,
    padding: 0,
    // need to use a content editable if we wanna animate this since input el forces width
    textAlign: !isExpanded && 'center',
    // card width is set at REFLECTION_WIDTH, so this can be a PX, too
    width: 200,
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
  // TODO check for duplicate titles
  return undefined
}

class ReflectionGroupTitleEditor extends Component<Props> {
  initialTitle: string
  inputRef = React.createRef<HTMLInputElement>()

  constructor (props: Props) {
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
      reflectionGroup: {reflectionGroupId}
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
    if (this.inputRef.current) {
      this.inputRef.current.select()
    }
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
      reflectionGroup: {reflectionGroupId, title}
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
      onError,
      onCompleted
    )
  }

  render () {
    const {
      isExpanded,
      error,
      readOnly,
      reflectionGroup: {title}
    } = this.props
    return (
      <React.Fragment>
        <RootBlock>
          <FormBlock onSubmit={this.onSubmit}>
            <NameInput
              isExpanded={isExpanded}
              onBlur={this.onSubmit}
              onChange={this.onChange}
              placeholder={RETRO_TOPIC_LABEL}
              readOnly={readOnly}
              innerRef={this.inputRef}
              size={20}
              type='text'
              value={title || ''}
            />
          </FormBlock>
          {error && <StyledError>{error}</StyledError>}
        </RootBlock>
        {!readOnly && <PencilIcon isExpanded={isExpanded} name='pencil' onClick={this.onClick} />}
      </React.Fragment>
    )
  }
}

reactLifecyclesCompat(ReflectionGroupTitleEditor)
export default createFragmentContainer(
  withAtmosphere(withMutationProps(ReflectionGroupTitleEditor)),
  graphql`
    fragment ReflectionGroupTitleEditor_reflectionGroup on RetroReflectionGroup {
      reflectionGroupId: id
      title
    }

    fragment ReflectionGroupTitleEditor_meeting on RetrospectiveMeeting {
      reflectionGroups {
        id
        title
      }
    }
  `
)
