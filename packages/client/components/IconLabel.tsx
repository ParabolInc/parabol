import {forwardRef, type ReactNode, useMemo} from 'react'
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
  Refresh,
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
} from '~/ui/icons'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'

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
      refresh: <Refresh />,
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

  const content = (
    <div
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className='flex items-center justify-center'
    >
      <div
        className={`flex items-center justify-center ${iconAfter ? 'order-2' : ''} ${iconLarge ? '[&_svg]:text-2xl' : '[&_svg]:text-lg'}`}
      >
        {iconElement}
      </div>
      {label && <div className={`whitespace-nowrap ${iconAfter ? 'mr-2' : 'ml-2'}`}>{label}</div>}
    </div>
  )

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side='top'>{tooltip}</TooltipContent>
      </Tooltip>
    )
  }

  return content
})

export default IconLabel
