import Add from '@mui/icons-material/Add'
import Archive from '@mui/icons-material/Archive'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Close from '@mui/icons-material/Close'
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
import Refresh from '@mui/icons-material/Refresh'
import RemoveCircle from '@mui/icons-material/RemoveCircle'
import Reply from '@mui/icons-material/Reply'
import Search from '@mui/icons-material/Search'
import SentimentSatisfied from '@mui/icons-material/SentimentSatisfied'
import TaskAlt from '@mui/icons-material/TaskAlt'
import Tune from '@mui/icons-material/Tune'
import UnfoldLess from '@mui/icons-material/UnfoldLess'
import UnfoldMore from '@mui/icons-material/UnfoldMore'
import WebAsset from '@mui/icons-material/WebAsset'
import Widgets from '@mui/icons-material/Widgets'
import {forwardRef, type ReactNode, useMemo} from 'react'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'

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

  return (
    <div
      ref={mergedRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className='flex items-center justify-center'
    >
      <div
        className={`flex items-center justify-center ${iconAfter ? 'order-2' : ''} ${iconLarge ? '[&_svg]:text-2xl' : '[&_svg]:text-lg'}`}
      >
        {iconElement}
      </div>
      {label && <div className={`whitespace-nowrap ${iconAfter ? 'mr-2' : 'ml-2'}`}>{label}</div>}
      {tooltip && tooltipPortal(tooltip)}
    </div>
  )
})

export default IconLabel
