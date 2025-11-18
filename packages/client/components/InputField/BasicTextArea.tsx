import styled from '@emotion/styled'
import * as React from 'react'
import {TextareaHTMLAttributes} from 'react'
import makeFieldColorPalette from '../../styles/helpers/makeFieldColorPalette'
import ui from '../../styles/ui'
import StyledError from '../StyledError'

const TextArea = styled('textarea')<{disabled?: boolean}>(({disabled}) => ({
  ...ui.fieldBaseStyles,
  ...ui.fieldSizeStyles.medium,
  ...makeFieldColorPalette('white', !disabled),
  minHeight: '5.75rem',
  ...(disabled && {...ui.fieldDisabled})
}))

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string | undefined | null
}

const BasicTextArea = (props: Props) => {
  const {error, ...rest} = props

  return (
    <React.Fragment>
      <TextArea {...rest} />
      {error && <StyledError>{error}</StyledError>}
    </React.Fragment>
  )
}

export default BasicTextArea
