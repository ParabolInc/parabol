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

const StyledIcon = styled('div')<Pick<Props, 'iconAfter'>>(({iconAfter}) => ({
  color: 'inherit',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  order: iconAfter ? 2 : undefined
}))
const notIconLargeStyles = {
  height: 18,
  width: 18
}

const SearchIcon = styled(Search)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const FormatBoldIcon = styled(FormatBold)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const FormatItalicIcon = styled(FormatItalic)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const FormatUnderlinedIcon = styled(FormatUnderlined)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const FormatStrikethroughIcon = styled(FormatStrikethrough)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const LinkIcon = styled(Link)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const StyledLabelIcon = styled(LabelIcon)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const SentimentSatisfiedIcon = styled(SentimentSatisfied)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const PersonPinIcon = styled(PersonPin)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const CodeIcon = styled(Code)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const WebAssetIcon = styled(WebAsset)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const FormatQuoteIcon = styled(FormatQuote)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const RemoveCircleIcon = styled(RemoveCircle)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const MoreVertIcon = styled(MoreVert)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const OpenInNewIcon = styled(OpenInNew)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const UnfoldMoreIcon = styled(UnfoldMore)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const ArrowBackIcon = styled(ArrowBack)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const AddIcon = styled(Add)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const KeyboardIcon = styled(Keyboard)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const ReplyIcon = styled(Reply)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const PublishIcon = styled(Publish)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const ArrowForwardIcon = styled(ArrowForward)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
)
const ArchiveIcon = styled(Archive)<{iconLarge?: boolean}>((iconLarge) =>
  iconLarge ? notIconLargeStyles : undefined
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
      <StyledIcon iconAfter={iconAfter}>
        {
          {
            format_bold: <FormatBoldIcon iconLarge={iconLarge} />,
            format_italic: <FormatItalicIcon iconLarge={iconLarge} />,
            format_underline: <FormatUnderlinedIcon iconLarge={iconLarge} />,
            format_strikethrough: <FormatStrikethroughIcon iconLarge={iconLarge} />,
            link: <LinkIcon iconLarge={iconLarge} />,
            label: <StyledLabelIcon iconLarge={iconLarge} />,
            sentiment_satisfied: <SentimentSatisfiedIcon iconLarge={iconLarge} />,
            person_pin: <PersonPinIcon iconLarge={iconLarge} />,
            code: <CodeIcon iconLarge={iconLarge} />,
            web_asset: <WebAssetIcon iconLarge={iconLarge} />,
            format_quote: <FormatQuoteIcon iconLarge={iconLarge} />,
            remove_circle: <RemoveCircleIcon iconLarge={iconLarge} />,
            more_vert: <MoreVertIcon iconLarge={iconLarge} />,
            open_in_new: <OpenInNewIcon iconLarge={iconLarge} />,
            unfold_more: <UnfoldMoreIcon iconLarge={iconLarge} />,
            arrow_back: <ArrowBackIcon iconLarge={iconLarge} />,
            add: <AddIcon iconLarge={iconLarge} />,
            keyboard: <KeyboardIcon iconLarge={iconLarge} />,
            search: <SearchIcon iconLarge={iconLarge} />,
            reply: <ReplyIcon iconLarge={iconLarge} />,
            publish: <PublishIcon />,
            arrow_forward: <ArrowForwardIcon iconLarge={iconLarge} />,
            archive: <ArchiveIcon iconLarge={iconLarge} />
          }[icon]
        }
      </StyledIcon>
      {label && <Label iconAfter={iconAfter}>{label}</Label>}
    </LabelBlock>
  )
})

export default IconLabel
