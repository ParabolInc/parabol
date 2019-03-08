import {EditorState, SelectionState} from 'draft-js'
import React, {Component, RefObject} from 'react'
import styled from 'react-emotion'
import RaisedButton from 'universal/components/RaisedButton'
import ui from 'universal/styles/ui'
import completeEntity from 'universal/utils/draftjs/completeEnitity'
import linkify from 'universal/utils/linkify'
import withForm, {WithFormProps} from '../../utils/relay/withForm'
import Legitity from '../../validation/Legitity'
import BasicInput from '../InputField/BasicInput'

interface Props extends WithFormProps {
  editorState: EditorState
  editorRef: HTMLInputElement

  innerRef: RefObject<HTMLDivElement>

  link: string | null

  removeModal(allowFocus: boolean): void

  selectionState: SelectionState

  setEditorState(editorState: EditorState): void

  text: string | null

  trackEditingComponent(componentName: string, isTracking: boolean): void
}

const ModalBoundary = styled('div')({
  color: ui.palette.dark,
  padding: '.5rem .5rem .5rem 1rem',
  minWidth: '20rem',
  outline: 0
})

const TextBlock = styled('div')({
  // use baseline so errors don't bump it off center
  alignItems: 'top',
  display: 'flex',
  marginBottom: '.5rem'
})

const InputLabel = styled('span')({
  display: 'block',
  fontSize: '.9375rem',
  fontWeight: 600,
  lineHeight: '2rem',
  marginRight: '.5rem'
})

const ButtonBlock = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
})

class EditorLinkChanger extends Component<Props> {
  componentWillMount() {
    const {trackEditingComponent} = this.props
    if (trackEditingComponent) {
      trackEditingComponent('editor-link-changer', true)
    }
  }

  componentWillUnmount() {
    const {trackEditingComponent} = this.props
    if (trackEditingComponent) {
      trackEditingComponent('editor-link-changer', false)
    }
  }

  onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const {
      editorState,
      editorRef,
      removeModal,
      selectionState,
      setEditorState,
      setDirtyField,
      validateField
    } = this.props
    setDirtyField()
    const {link: linkRes, text: textRes} = validateField()
    if (linkRes.error || textRes.error) return
    const link = linkRes.value as string
    const text = textRes.value as string
    const href = linkify.match(link)[0].url
    removeModal(true)
    const focusedEditorState = EditorState.forceSelection(editorState, selectionState)
    const nextEditorState = completeEntity(focusedEditorState, 'LINK', {href}, text, {
      keepSelection: true
    })
    setEditorState(nextEditorState)
    setTimeout(() => editorRef.focus(), 0)
  }

  handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as any)) {
      this.props.removeModal(true)
    }
  }

  handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      const {editorRef, removeModal} = this.props
      removeModal(true)
      setTimeout(() => editorRef.focus(), 0)
    }
  }

  render() {
    const {link, fields, innerRef, onChange, text} = this.props
    const hasError = !!(fields.text.error || fields.link.error)
    const label = text ? 'Update' : 'Add'
    return (
      <ModalBoundary
        onBlur={this.handleBlur}
        onKeyDown={this.handleKeyDown}
        tabIndex={-1}
        innerRef={innerRef}
      >
        <form onSubmit={this.onSubmit}>
          {text !== null && (
            <TextBlock>
              <InputLabel>{'Text'}</InputLabel>
              <BasicInput {...fields.text} onChange={onChange} autoFocus name="text" />
            </TextBlock>
          )}
          <TextBlock>
            <InputLabel>{'Link'}</InputLabel>
            <BasicInput
              {...fields.link}
              autoFocus={link === null && text !== ''}
              onChange={onChange}
              name="link"
              spellCheck={false}
            />
          </TextBlock>
          <ButtonBlock>
            <RaisedButton disabled={hasError} onClick={this.onSubmit} palette="mid">
              {label}
            </RaisedButton>
          </ButtonBlock>
        </form>
      </ModalBoundary>
    )
  }
}

const form = withForm({
  text: {
    getDefault: ({text}) => text,
    validate: (value) =>
      new Legitity(value)
        .trim()
        .required()
        .min(1, 'Maybe give it a name?')
        .max(100, 'That name is looking pretty long')
  },
  link: {
    getDefault: ({link}) => link,
    validate: (value) =>
      new Legitity(value).test((maybeUrl) => {
        if (!maybeUrl) return 'No link provided'
        const links = linkify.match(maybeUrl)
        return !links ? 'Not looking too linky' : undefined
      })
  }
})

export default form(EditorLinkChanger)
