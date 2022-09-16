import styled from '@emotion/styled'
import {
  Add,
  Archive,
  ArrowBack,
  ArrowForward,
  Close,
  Code,
  FormatBold,
  FormatItalic,
  FormatQuote,
  FormatStrikethrough,
  FormatUnderlined,
  Keyboard,
  Label as LabelIcon,
  Link,
  MoreVert,
  OpenInNew,
  PersonPin,
  Publish,
  RemoveCircle,
  Reply,
  Search,
  SentimentSatisfied,
  UnfoldMore,
  WebAsset
} from '@mui/icons-material'
import React, {forwardRef, ReactNode} from 'react'

const LabelBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center'
})

const Label = styled('div')<{iconAfter?: boolean}>(({iconAfter}) => ({
  color: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  margin: iconAfter ? `0 8px 0 0` : `0 0 0 8px`,
  whiteSpace: 'nowrap'
}))

const StyledIcon = styled('div')<{iconAfter: boolean | undefined; iconLarge: boolean | undefined}>(
  ({iconAfter, iconLarge}) => ({
    color: 'inherit',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    order: iconAfter ? 2 : undefined,
    '& svg': {
      fontSize: iconLarge ? 24 : 18
    }
  })
)

interface Props {
  //FIXME 6062: change to React.ComponentType
  icon: string
  iconAfter?: boolean
  iconLarge?: boolean
  label?: ReactNode
  onMouseEnter?(): void
  onMouseLeave?(): void
  onClick?(): void
}

const IconLabel = forwardRef((props: Props, ref: any) => {
  const {icon, label, onClick, onMouseEnter, onMouseLeave, iconAfter, iconLarge} = props
  return (
    <LabelBlock ref={ref} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>
      <StyledIcon iconAfter={iconAfter} iconLarge={iconLarge}>
        {
          {
            format_bold: <FormatBold />,
            format_italic: <FormatItalic />,
            format_underline: <FormatUnderlined />,
            format_strikethrough: <FormatStrikethrough />,
            link: <Link />,
            label: <LabelIcon />,
            sentiment_satisfied: <SentimentSatisfied />,
            person_pin: <PersonPin />,
            code: <Code />,
            web_asset: <WebAsset />,
            format_quote: <FormatQuote />,
            remove_circle: <RemoveCircle />,
            more_vert: <MoreVert />,
            open_in_new: <OpenInNew />,
            unfold_more: <UnfoldMore />,
            arrow_back: <ArrowBack />,
            add: <Add />,
            keyboard: <Keyboard />,
            search: <Search />,
            reply: <Reply />,
            arrow_forward: <ArrowForward />,
            archive: <Archive />,
            close: <Close />,
            publish: <Publish />
          }[icon]
        }
      </StyledIcon>
      {label && <Label iconAfter={iconAfter}>{label}</Label>}
    </LabelBlock>
  )
})

export default IconLabel
