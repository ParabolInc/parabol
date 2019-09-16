import React from 'react'
import ui from '../../styles/ui'
import styled from '@emotion/styled'
import LabelHeading from '../LabelHeading/LabelHeading'

const FieldLabelStyles = styled(LabelHeading)<Pick<Props, 'customStyles' | 'fieldSize' | 'indent' | 'inline'>>(({customStyles, fieldSize, indent, inline}) => {
  const size = fieldSize || ui.buttonSizeOptions[1]
  const paddingLeft = fieldSize && indent ? ui.controlBlockPaddingHorizontal[size] : 0
  const inlineSizeStyles = ui.fieldSizeStyles[size]
  const inlineStyles = {
    lineHeight: inlineSizeStyles.lineHeight,
    paddingBottom: ui.controlBlockPaddingVertical[size],
    paddingTop: ui.controlBlockPaddingVertical[size]
  }
  const useInlineStyles = fieldSize && inline && inlineStyles
  return {
    display: 'block',
    padding: 0,
    textTransform: 'none',
    // 1. Line up controls when inline
    ...useInlineStyles,
    // 2. Optionally line up left edge of text using indent bool
    paddingLeft,
    // 3. Do what ya want
    ...customStyles
  }
})

const FieldLabelBlock = FieldLabelStyles.withComponent('label')

interface Props {
  customStyles: object
  fieldSize: string
  htmlFor: string
  indent: boolean
  inline: boolean
  label: string
  styles: object
}

const FieldLabel = (props: Props) => {
  const {customStyles, fieldSize, indent, inline, htmlFor, label} = props
  return (
    <FieldLabelBlock
      customStyles={customStyles}
      fieldSize={fieldSize}
      indent={indent}
      inline={inline}
      htmlFor={htmlFor}
    >
      {label}
    </FieldLabelBlock>
  )
}

// FieldLabel.propTypes = {
//   customStyles: PropTypes.object,
//   fieldSize: PropTypes.oneOf(ui.fieldSizeOptions),
//   htmlFor: PropTypes.string,
//   indent: PropTypes.bool,
//   inline: PropTypes.bool,
//   label: PropTypes.string,
//   styles: PropTypes.object
// }

export default FieldLabel
