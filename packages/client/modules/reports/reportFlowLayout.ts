import {distinctKeysAt, type ReportResultKey, type ReportResultRow} from './reportRows'

export const FLOW_WIDTH = 640
export const FLOW_NODE_WIDTH = 10
const LABEL_SPACE = 150
const BAND_SPACE = 200
const GAP = 10
// a small value still gets room for its label
const MIN_SLOT = 18
const PADDING = 8

export interface ReportFlowNode {
  key: ReportResultKey
  stage: number
  rank: number
  total: number
  x: number
  y: number
  height: number
}

export interface ReportFlowLink {
  source: ReportFlowNode
  target: ReportFlowNode
  amount: number
  sourceY: number
  targetY: number
  thickness: number
}

const sumOf = (rows: readonly ReportResultRow[]) =>
  rows.reduce((sum, {values}) => sum + (values[0] ?? 0), 0)

// Every stage adds up to the same total, so each stage's nodes share one scale. Values with nothing sit
// below the rest with no band
export const layoutReportFlow = (stageCount: number, rows: readonly ReportResultRow[]) => {
  const grandTotal = sumOf(rows)
  const scale = grandTotal > 0 ? BAND_SPACE / grandTotal : 0
  const xOf = (stage: number) =>
    LABEL_SPACE + (stage * (FLOW_WIDTH - 2 * LABEL_SPACE - FLOW_NODE_WIDTH)) / (stageCount - 1)
  let height = 0
  const stages = Array.from({length: stageCount}, (_, stage) => {
    const totals = distinctKeysAt(rows, stage).map((key) => ({
      key,
      total: sumOf(rows.filter(({keys}) => keys[stage]?.value === key.value))
    }))
    const ordered = [
      ...totals.filter(({total}) => total > 0),
      ...totals.filter(({total}) => !total)
    ]
    let y = PADDING
    const nodes = ordered.map(({key, total}, rank): ReportFlowNode => {
      const nodeHeight = total > 0 ? total * scale : 2
      const node = {key, stage, rank, total, x: xOf(stage), y, height: nodeHeight}
      y += Math.max(nodeHeight, MIN_SLOT) + GAP
      return node
    })
    height = Math.max(height, y - GAP + PADDING)
    return nodes
  })
  const links = stages.slice(0, -1).flatMap((sources, stage) => {
    const targets = stages[stage + 1]!
    const amounts = sources.flatMap((source) =>
      targets.flatMap((target) => {
        const amount = sumOf(
          rows.filter(
            ({keys}) =>
              keys[stage]?.value === source.key.value && keys[stage + 1]?.value === target.key.value
          )
        )
        return amount > 0 ? [{source, target, amount}] : []
      })
    )
    // a node's bands leave in the order of the nodes they go to, and arrive in the order they came from
    const sourceOffsets = new Map<ReportFlowNode, number>()
    return amounts.map(({source, target, amount}): ReportFlowLink => {
      const thickness = amount * scale
      const sourceY = source.y + (sourceOffsets.get(source) ?? 0)
      const targetY =
        target.y +
        amounts
          .filter((link) => link.target === target && link.source.rank < source.rank)
          .reduce((sum, link) => sum + link.amount * scale, 0)
      sourceOffsets.set(source, (sourceOffsets.get(source) ?? 0) + thickness)
      return {source, target, amount, sourceY, targetY, thickness}
    })
  })
  return {stages, links, height, grandTotal}
}

export const toFlowBandPath = ({source, target, sourceY, targetY, thickness}: ReportFlowLink) => {
  const x0 = source.x + FLOW_NODE_WIDTH
  const x1 = target.x
  const mx = (x0 + x1) / 2
  return `M${x0},${sourceY} C${mx},${sourceY} ${mx},${targetY} ${x1},${targetY} L${x1},${targetY + thickness} C${mx},${targetY + thickness} ${mx},${sourceY + thickness} ${x0},${sourceY + thickness} Z`
}
