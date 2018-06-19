import PropTypes from 'prop-types'
import React from 'react'
import FieldHelpText from 'universal/components/FieldHelpText/FieldHelpText'
import RaisedButton from 'universal/components/RaisedButton'
import ui from 'universal/styles/ui'
import styled from 'react-emotion'

const hiddenUglyButton = {
  display: 'none'
}

const Control = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  overflow: 'hidden',
  padding: '.5rem',
  position: 'relative'
})

const FileInput = (props) => {
  const {
    accept,
    buttonLabel = 'Choose File',
    buttonPalette = 'gray',
    buttonSize = 'small',
    doSubmit,
    meta: {touched, error}
  } = props
  let errorString = error
  if (typeof error === 'object') {
    errorString = Object.keys(error)
      .map((k) => error[k])
      .join(', ')
  }
  let el
  return (
    <div>
      <Control>
        <RaisedButton
          size={buttonSize}
          onClick={() => {
            el.click()
          }}
          palette={buttonPalette}
        >
          {buttonLabel}
        </RaisedButton>
        <input
          accept={accept}
          onChange={(e) => {
            // send the file to the redux-form FileList manager
            props.input.onChange(e.currentTarget.files[0])
            // if not pushed to the back of the queue, the values don't update, even if the parent component is force updated
            setTimeout(() => doSubmit(), 0)
          }}
          style={hiddenUglyButton}
          type='file'
          value={undefined} // required to avoid value change security console message
          ref={(c) => {
            el = c
          }}
        />
      </Control>
      {touched && error && <FieldHelpText hasErrorText helpText={errorString} />}
    </div>
  )
}

FileInput.propTypes = {
  accept: PropTypes.any,
  buttonLabel: PropTypes.string,
  buttonSize: PropTypes.oneOf(ui.buttonSizeOptions),
  buttonPalette: PropTypes.oneOf(ui.paletteOptions),
  doSubmit: PropTypes.func,
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired
}

export default FileInput
