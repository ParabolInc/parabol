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
  RemoveCircle,
  Reply,
  Search,
  SentimentSatisfied,
  TaskAlt,
  Tune,
  UnfoldLess,
  UnfoldMore,
  WebAsset,
  Widgets
} from '@mui/icons-material'
import {forwardRef, type ReactNode, useMemo} from 'react'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'

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

const StyledIcon = styled('div')<{
  iconAfter: boolean | undefined
  iconLarge: boolean | undefined
}>(({iconAfter, iconLarge}) => ({
  color: 'inherit',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  order: iconAfter ? 2 : undefined,
  svg: {
    fontSize: iconLarge ? 24 : 18
  }
}))

interface Props {
  icon: string | React.ComponentType<any>
  iconAfter?: boolean
  iconLarge?: boolean
  label?: ReactNode
  tooltip?: ReactNode
  onMouseEnter?(): void
  onMouseLeave?(): void
  onClick?(): void
}

const IconLabel = forwardRef((props: Props, ref: any) => {
  const {icon, label, onClick, onMouseEnter, onMouseLeave, iconAfter, iconLarge, tooltip} = props

  const {openTooltip, closeTooltip, tooltipPortal, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER,
    {disabled: !tooltip}
  )

  const handleMouseEnter = () => {
    if (tooltip) openTooltip()
    onMouseEnter?.()
  }

  const handleMouseLeave = () => {
    if (tooltip) closeTooltip()
    onMouseLeave?.()
  }

  // Merge refs
  const mergedRef = (node: HTMLDivElement) => {
    originRef.current = node
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }

  // Icon mapping for string-based icons
  const iconMapping: Record<string, ReactNode> = useMemo(
    () => ({
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
      unfold_less: <UnfoldLess />,
      unfold_more: <UnfoldMore />,
      arrow_back: <ArrowBack />,
      add: <Add />,
      keyboard: <Keyboard />,
      search: <Search />,
      reply: <Reply />,
      arrow_forward: <ArrowForward />,
      archive: <Archive />,
      close: <Close />,
      tune: <Tune />,
      task_alt: <TaskAlt />,
      widgets: <Widgets />
    }),
    []
  )

  // Render icon based on type
  const iconElement = useMemo(() => {
    if (typeof icon === 'string') {
      return iconMapping[icon]
    }
    const IconComponent = icon as React.ComponentType
    return <IconComponent />
  }, [icon, iconMapping])

  return (
    <LabelBlock
      ref={mergedRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <StyledIcon iconAfter={iconAfter} iconLarge={iconLarge}>
        {iconElement}
      </StyledIcon>
      {label && <Label iconAfter={iconAfter}>{label}</Label>}
      {tooltip && tooltipPortal(tooltip)}
    </LabelBlock>
  )
})

export default IconLabel
