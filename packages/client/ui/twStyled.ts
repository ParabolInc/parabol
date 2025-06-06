import {createElement, ElementType, FunctionComponent, HTMLAttributes, ReactHTML} from 'react'
import {ClassValue, cn} from './cn'

type PropsType<E> = E extends keyof ReactHTML
  ? HTMLAttributes<ElementType<E>>
  : E extends FunctionComponent<infer P>
    ? P
    : never
type ClassValueFun<E extends Record<string, boolean>> = (exptraProps: E) => ClassValue
type OptionalFun<E extends Record<string, boolean>> = ClassValueFun<E> | ClassValue

/**
 * Helper similar to `styled` but with clsx style tailwind classes.
 *
 * Usage:
 *   const StyledDiv = twStyled('div')('bg-tomato-500 p-4')
 *   const DynamiclyStyledDiv = twStyled('div')(({isHighlighted}: {isHighlighted: boolean}) => [
 *     'bg-sky-500 p-4',
 *     {'bg-tomato-500': isHighlighted},
 *     isHighlighted && 'shadow-lg'
 *   ])
 *   const StyledCustomComponent = twStyled(MyCustomComponent)('bg-tomato-500 p-4')
 */
export const twStyled =
  <P extends PropsType<E>, E extends keyof ReactHTML | FunctionComponent<any>>(element: E) =>
  <Extras extends Record<string, boolean> = {}>(
    fun: OptionalFun<Extras>,
    ...classValues: ClassValue[]
  ) =>
  (props: P & Extras) => {
    const extraValues = typeof fun === 'function' ? fun(props as Extras) : fun
    const {children, className: classNameOverrides, ...rest} = props
    const mergedClassName = cn(extraValues, ...classValues, classNameOverrides)
    return createElement(element, {...rest, className: mergedClassName}, children)
  }
