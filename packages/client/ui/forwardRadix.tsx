// When building from radix primitives, use this instead of React.forwardRef
// To get type safety directly from radix

import type * as React from 'react'
import {forwardRef, type RefForwardingComponent} from 'react'

type RadixProps<T> = T extends React.ForwardRefExoticComponent<infer U> ? U : T
type RadixAttrib<T> = T extends React.RefAttributes<infer U> ? U : T
type RadixEl<T> = RadixAttrib<RadixProps<T>>

export const forwardRadix = <T,>(c: RefForwardingComponent<RadixEl<T>, RadixProps<T>>) =>
  forwardRef(c)
