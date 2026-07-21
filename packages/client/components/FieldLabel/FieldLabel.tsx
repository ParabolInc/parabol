import styled from '@emotion/styled'
import ui from '../../styles/ui'

// Styles the <label> directly rather than composing styled(LabelHeading).withComponent().
// withComponent swaps the base element, so once LabelHeading moved to Tailwind its classes
// were dropped on the floor and this label lost its color/size/weight/tracking entirely.
// These base values mirror LabelHeading, minus the uppercase this has always overridden.
const FieldLabelStyles = styled('label')<
  Pick<Props, 'customStyles' | 'fieldSize' | 'indent' | 'inline'>
>(({customStyles, fieldSize, indent, inline}) => {
  const size = (fieldSize || ui.buttonSizeOptions[1]) as 'small' | 'medium' | 'large'
  const paddingLeft = fieldSize && indent ? ui.controlBlockPaddingHorizontal[size] : 0
  const inlineSizeStyles = ui.fieldSizeStyles[size]
  const inlineStyles = {
    lineHeight: inlineSizeStyles.lineHeight,
    paddingBottom: ui.controlBlockPaddingVertical[size],
    paddingTop: ui.controlBlockPaddingVertical[size]
  }
  const useInlineStyles = fieldSize && inline && inlineStyles
  return {
    color: 'var(--color-fg-secondary)',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '.03em',
    lineHeight: '16px',
    userSelect: 'none',
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

const FieldLabelBlock = FieldLabelStyles

interface Props {
  customStyles?: object
  fieldSize: string
  htmlFor?: string
  indent: boolean
  inline?: boolean
  label: string
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

export default FieldLabel
