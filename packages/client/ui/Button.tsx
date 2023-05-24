import React, {forwardRef, ElementType, ComponentPropsWithRef} from 'react'
import clsx from 'clsx'

type Type = 'primary' | 'secondary' | 'outline'
type Shape = 'rounded' | 'circle' | 'pill'

//TODO: implement proper styles
const TYPE_STYLES: Record<Type, string> = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
  outline: 'border border-gray-500 hover:bg-gray-600 text-gray-500'
}

//TODO: implement proper styles
const SHAPE_STYLES: Record<Shape, string> = {
  rounded: 'rounded',
  circle: 'rounded-full',
  pill: 'rounded-full'
}

type Props<T extends ElementType> = {
  as?: T
  className?: string
  type?: Type
  shape?: Shape
} & ComponentPropsWithRef<T>

export const Button = forwardRef(
  <T extends ElementType = 'button'>(
    props: Props<T>,
    ref: React.Ref<T extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[T] : T>
  ) => {
    const {as: Component = 'button', className, type, shape, ...rest} = props

    const typeStyle = type ? TYPE_STYLES[type] : ''
    const shapeStyle = shape ? SHAPE_STYLES[shape] : ''

    return (
      <Component className={clsx(typeStyle, shapeStyle)} {...rest} ref={ref}>
        {props.children}
      </Component>
    )
  }
)

Button.displayName = 'Button'
