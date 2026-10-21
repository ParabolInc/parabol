import useResolvedTheme from '../../hooks/useResolvedTheme'
import {
  REPORT_DIMENSION_LABELS,
  REPORT_MEASURES,
  type ReportSpec
} from '../../shared/reports/reportCatalog'
import {cn} from '../../ui/cn'
import {
  FLOW_NODE_WIDTH,
  FLOW_WIDTH,
  layoutReportFlow,
  type ReportFlowNode,
  toFlowBandPath
} from './reportFlowLayout'
import type {ReportResultRow} from './reportRows'
import {getReportFlowColor, REPORT_NONE_COLOR} from './reportSeriesColors'

interface Props {
  spec: ReportSpec
  rows: readonly ReportResultRow[]
  isCompact: boolean
}

const LABEL_GAP = 8

const ReportFlowView = ({spec, rows, isCompact}: Props) => {
  const theme = useResolvedTheme()
  const dimensions = spec.breakdown.map(({dimension}) => dimension)
  const {stages, links, height, grandTotal} = layoutReportFlow(dimensions.length, rows)
  if (grandTotal === 0) {
    return <p className='m-0 py-6 text-center text-fg-muted text-sm'>Nothing to show</p>
  }
  const lastStage = dimensions.length - 1
  const colorOf = ({stage, key, rank}: ReportFlowNode) =>
    getReportFlowColor(dimensions[stage]!, key.value, rank)[theme]
  const description = [
    `${grandTotal.toLocaleString()} ${REPORT_MEASURES[spec.measures[0]!].label.toLowerCase()}`,
    ...stages.map(
      (nodes, stage) =>
        `${REPORT_DIMENSION_LABELS[dimensions[stage]!]}: ${nodes.map(({key, total}) => `${key.label} ${total}`).join(', ')}`
    )
  ].join('. ')
  // on a narrow screen the page scrolls the flow sideways rather than shrink its labels past reading
  return (
    <div className={isCompact ? undefined : 'overflow-x-auto'}>
      <svg
        viewBox={`0 0 ${FLOW_WIDTH} ${height}`}
        role='img'
        aria-label={description}
        className={cn('mx-auto block h-auto w-full max-w-[760px]', !isCompact && 'min-w-[560px]')}
      >
        {links.map((link) => (
          <path
            key={`${link.source.stage}:${link.source.key.value}:${link.target.key.value}`}
            d={toFlowBandPath(link)}
            fill={colorOf(link.target.stage === lastStage ? link.target : link.source)}
            fillOpacity={0.45}
          />
        ))}
        {stages.flat().map((node) => {
          const isFirst = node.stage === 0
          const isMiddle = !isFirst && node.stage !== lastStage
          return (
            <g key={`${node.stage}:${node.key.value}`}>
              <rect
                x={node.x}
                y={node.y}
                width={FLOW_NODE_WIDTH}
                height={node.height}
                fill={node.total > 0 ? colorOf(node) : REPORT_NONE_COLOR[theme]}
              />
              <text
                x={isFirst ? node.x - LABEL_GAP : node.x + FLOW_NODE_WIDTH + LABEL_GAP}
                y={node.y + node.height / 2 + 4}
                textAnchor={isFirst ? 'end' : 'start'}
                fontSize={13}
                strokeWidth={isMiddle ? 4 : 0}
                strokeLinejoin='round'
                paintOrder='stroke'
                className={
                  node.total > 0
                    ? 'fill-fg-primary stroke-surface-card'
                    : 'fill-fg-muted stroke-surface-card'
                }
              >
                {node.key.label} <tspan fontWeight={600}>{node.total.toLocaleString()}</tspan>
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default ReportFlowView
