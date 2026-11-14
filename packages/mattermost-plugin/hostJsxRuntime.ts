// Mattermost supplies React at runtime, so JSX must build elements with the host's createElement
// rather than a bundled jsx-runtime whose element format only matches one React major
import {createElement, type ElementType, Fragment, type Key, type ReactNode} from 'react'

const create = (
  type: ElementType,
  props: Record<string, unknown>,
  key: Key | undefined,
  isStaticChildren: boolean
) => {
  const {children, ...config} = props
  if (key !== undefined) config.key = key
  if (!('children' in props)) return createElement(type, config)
  // static siblings go in as separate arguments, or React would ask them for keys like a list
  if (isStaticChildren && Array.isArray(children)) return createElement(type, config, ...children)
  return createElement(type, config, children as ReactNode)
}

export const jsx = (type: ElementType, props: Record<string, unknown>, key?: Key) =>
  create(type, props, key, false)

export const jsxs = (type: ElementType, props: Record<string, unknown>, key?: Key) =>
  create(type, props, key, true)

export {Fragment}
