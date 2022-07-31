import styled from '@emotion/styled'
import Add from '@mui/icons-material/Add'
import Archive from '@mui/icons-material/Archive'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Code from '@mui/icons-material/Code'
import FormatBold from '@mui/icons-material/FormatBold'
import FormatItalic from '@mui/icons-material/FormatItalic'
import FormatQuote from '@mui/icons-material/FormatQuote'
import FormatStrikethrough from '@mui/icons-material/FormatStrikethrough'
import FormatUnderlined from '@mui/icons-material/FormatUnderlined'
import Keyboard from '@mui/icons-material/Keyboard'
import LabelIcon from '@mui/icons-material/Label'
import Link from '@mui/icons-material/Link'
import MoreVert from '@mui/icons-material/MoreVert'
import OpenInNew from '@mui/icons-material/OpenInNew'
import PersonPin from '@mui/icons-material/PersonPin'
import Publish from '@mui/icons-material/Publish'
import RemoveCircle from '@mui/icons-material/RemoveCircle'
import Reply from '@mui/icons-material/Reply'
import Search from '@mui/icons-material/Search'
import SentimentSatisfied from '@mui/icons-material/SentimentSatisfied'
import UnfoldMore from '@mui/icons-material/UnfoldMore'
import WebAsset from '@mui/icons-material/WebAsset'
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

const StyledIcon = styled('div')<Pick<Props, 'iconAfter' | 'iconLarge'>>(
  ({iconAfter, iconLarge}) => ({
    color: 'inherit',
    display: 'block',
    height: iconLarge ? 24 : 18,
    width: iconLarge ? 24 : 18,
    order: iconAfter ? 2 : undefined
  })
)

interface Props {
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
            publish: <Publish />,
            arrow_forward: <ArrowForward />,
            archive: <Archive />
          }[icon]
        }
      </StyledIcon>
      {label && <Label iconAfter={iconAfter}>{label}</Label>}
    </LabelBlock>
  )
})

export default IconLabel
