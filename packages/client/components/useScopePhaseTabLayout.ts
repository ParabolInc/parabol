import {useLayoutEffect, useRef, useState} from 'react'
import useResizeObserver from '~/hooks/useResizeObserver'
import layoutScopePhaseTabs, {type ScopePhaseLayoutTab} from './layoutScopePhaseTabs'

interface Measurements {
  barWidth: number
  triggerWidth: number
  widths: Record<string, number>
}

interface Params<T extends ScopePhaseLayoutTab> {
  integrations: readonly T[]
  parabol: T
  heldPickKey: string | null
  savedActiveKey: string | null
}

const measuredWidth = (element: Element | null) =>
  element ? Math.ceil(element.getBoundingClientRect().width) : 0

const useScopePhaseTabLayout = <T extends ScopePhaseLayoutTab>(params: Params<T>) => {
  const {integrations, parabol, heldPickKey, savedActiveKey} = params
  const barRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [measurements, setMeasurements] = useState<Measurements | null>(null)

  const measure = () => {
    const bar = barRef.current
    const row = measureRef.current
    if (!bar || !row) return
    const widths: Record<string, number> = {}
    row.querySelectorAll<HTMLElement>('[data-scope-tab]').forEach((element) => {
      const key = element.dataset.scopeTab
      if (key) widths[key] = measuredWidth(element)
    })
    const triggerWidth = measuredWidth(row.querySelector('[data-scope-trigger]'))
    const next = {barWidth: bar.clientWidth, triggerWidth, widths}
    setMeasurements((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
  }

  const tabKeys = integrations.map(({key}) => key).join()
  useLayoutEffect(measure, [tabKeys])
  useResizeObserver(measure, barRef)
  useResizeObserver(measure, measureRef)

  const layout = measurements
    ? layoutScopePhaseTabs({integrations, parabol, heldPickKey, savedActiveKey, ...measurements})
    : null
  return {barRef, measureRef, layout}
}

export default useScopePhaseTabLayout
