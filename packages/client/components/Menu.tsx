import React, {
  Children,
  cloneElement,
  forwardRef,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import styled from '@emotion/styled'
import MenuItemAnimation from './MenuItemAnimation'
import {PortalStatus} from '../hooks/usePortal'

const isMenuItem = (node: any) => node && node.onClick
const REACT_ELEMENT = Symbol.for('react.element')
const isReactElement = (child: any) => child && child.$$typeof === REACT_ELEMENT

const MenuStyles = styled('div')({
  maxHeight: 224,
  maxWidth: 400,
  outline: 0,
  // VERY important! If not present, draft-js gets confused & thinks the menu is the selection rectangle
  userSelect: 'none'
})

interface Props {
  ariaLabel: string
  children: ReactNode
  className?: string
  closePortal: () => void
  defaultActiveIdx?: number
  keepParentFocus?: boolean
  resetActiveOnChanges?: any[]
  tabReturns?: boolean
  isDropdown?: boolean
  portalStatus: PortalStatus
}

const Menu = forwardRef((props: Props, ref: any) => {
  const {
    ariaLabel,
    children,
    className,
    closePortal,
    defaultActiveIdx,
    isDropdown,
    keepParentFocus,
    resetActiveOnChanges,
    portalStatus,
    tabReturns
  } = props
  const [activeIdx, setActiveIdx] = useState<number>(defaultActiveIdx || 0)
  const menuRef = useRef<HTMLDivElement>(null)
  const itemHandles = useRef<{onClick: (e?: React.MouseEvent | React.KeyboardEvent) => void}[]>([])

  useImperativeHandle(ref, () => ({
    handleKeyDown
  }))

  useEffect(
    () => {
      if (defaultActiveIdx === undefined) {
        const firstMenuItemIdx = itemHandles.current.findIndex(isMenuItem)
        setActiveIdx(Math.max(0, firstMenuItemIdx))
        if (!keepParentFocus) {
          menuRef.current && menuRef.current.focus()
        }
      }
    },
    resetActiveOnChanges ||
      [
        /* eslint-disable-line react-hooks/exhaustive-deps*/
      ]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (keepParentFocus) {
        // used for e.g. the emoji menu
        e.preventDefault()
      }
    },
    [keepParentFocus]
  )

  const setSafeIdx = useCallback(
    (idx: number) => {
      const childArr = itemHandles.current
      let nextIdx
      if (activeIdx < idx) {
        for (let ii = idx; ii < childArr.length; ii++) {
          const nextChild = childArr[ii]
          if (isMenuItem(nextChild)) {
            nextIdx = ii
            break
          }
        }
      } else if (activeIdx > idx) {
        for (let ii = idx; ii >= 0; ii--) {
          const nextChild = childArr[ii]
          if (isMenuItem(nextChild)) {
            nextIdx = ii
            break
          } else {
            const {current} = menuRef
            if (!current) return
            const el = current.parentElement || current
            // if we're at the top & there's a header, put the header into view
            el.scrollTo(0, 0)
          }
        }
      }
      if (
        nextIdx === null ||
        nextIdx === undefined ||
        nextIdx === activeIdx ||
        nextIdx < 0 ||
        nextIdx >= childArr.length
      ) {
        return
      }
      setActiveIdx(nextIdx)
    },
    [activeIdx]
  )

  const makeSmartChildren = useCallback(
    (children: ReactNode) => {
      // toArray removes bools whereas map does not. Use the filter to remove possible portals
      const childArr = Children.toArray(children)
      const itemCount = childArr.length
      return childArr.map((child, idx) => {
        if (!child) return null
        if (!isReactElement(child)) return child
        // overloading a ref callback with useful props means intermediary components only need to forward the ref
        const ref = (c) => {
          itemHandles.current[idx] = c
        }
        ref.closePortal = closePortal
        ref.isActive = activeIdx === idx
        ref.activate = () => setSafeIdx(idx)
        return (
          <MenuItemAnimation
            key={`mi${(child as any).key || child}`}
            idx={idx}
            itemsToAnimate={Math.min(10, itemCount)}
            isDropdown={!!isDropdown}
            portalStatus={portalStatus}
          >
            {cloneElement(child as ReactElement, {ref})}
          </MenuItemAnimation>
        )
      })
    },
    [activeIdx, setSafeIdx, closePortal, isDropdown, portalStatus]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSafeIdx(activeIdx + 1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSafeIdx(activeIdx - 1)
      } else if (e.key === 'Enter' || (tabReturns && e.key === 'Tab')) {
        e.preventDefault()
        const itemHandle = itemHandles.current[activeIdx]
        itemHandle?.onClick?.(e)
      } else if (e.key === 'Tab') {
        e.preventDefault()
        closePortal()
      }
      return e.defaultPrevented
    },
    [activeIdx, tabReturns, closePortal, setSafeIdx]
  )

  return (
    <MenuStyles
      role='menu'
      aria-label={ariaLabel}
      className={className}
      tabIndex={-1}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      ref={menuRef}
    >
      {makeSmartChildren(children)}
    </MenuStyles>
  )
})

export default Menu
