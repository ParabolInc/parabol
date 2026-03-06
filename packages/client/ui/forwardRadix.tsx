// When building from radix primitives, use this instead of React.forwardRef
// To get type safety directly from radix

import type * as React from 'react'
import {type ForwardRefRenderFunction, forwardRef} from 'react'

type RadixProps<T> = T extends React.ForwardRefExoticComponent<infer U> ? U : T
type RadixAttrib<T> = T extends React.RefAttributes<infer U> ? U : T
type RadixEl<T> = RadixAttrib<RadixProps<T>>

// React 18 changed forwardRef to wrap props in PropsWithoutRef<P>.
// RadixProps<T> already excludes ref, so the cast is safe.
export const forwardRadix = <T,>(c: ForwardRefRenderFunction<RadixEl<T>, RadixProps<T>>) =>
  forwardRef(c as ForwardRefRenderFunction<RadixEl<T>, React.PropsWithoutRef<RadixProps<T>>>)
