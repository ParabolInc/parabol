import graphql from 'babel-plugin-relay/macro'
import {AnimatePresence} from 'motion/react'
import {type ReactElement, useLayoutEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import useResizeObserver from '~/hooks/useResizeObserver'
import type {AvatarList_users$key} from '../__generated__/AvatarList_users.graphql'
import useOverflowAvatars from '../hooks/useOverflowAvatars'
import {BezierCurve} from '../types/constEnums'
import AvatarListUser from './AvatarListUser'
import OverflowAvatar from './OverflowAvatar'

const widthToOverlap = {
  28: 8,
  46: 16
}

// hard coding for now until we have
// a better solution for handling gutters
// for a component that may not be there
const sizeToHeightBump = {
  28: 4,
  46: 0
}

interface Props {
  users: AvatarList_users$key
  onUserClick?: (userId: string) => void
  onOverflowClick?: () => void
  size: 28 | 46
  emptyEl?: ReactElement
  isAnimated?: boolean
  borderColor?: string
  maxAvatars?: number
}

const AvatarList = (props: Props) => {
  const {users: usersRef, onUserClick, onOverflowClick, size, emptyEl, borderColor} = props
  const users = useFragment(
    graphql`
      fragment AvatarList_users on User @relay(plural: true) {
        id
        ...AvatarListUser_user
      }
    `,
    usersRef
  )
  const rowRef = useRef<HTMLDivElement>(null)
  const overlap = widthToOverlap[size]
  const offsetSize = size - overlap

  const [maxAvatars, setMaxAvatars] = useState(0)
  const checkOverflow = () => {
    const {current: el} = rowRef
    if (!el) return
    const {clientWidth: totalWidth} = el
    const lappedAvatarWidth = size - overlap
    const maxAvatars = Math.floor((totalWidth - size) / lappedAvatarWidth)
    setMaxAvatars(maxAvatars)
  }
  useLayoutEffect(checkOverflow, [])
  useResizeObserver(checkOverflow, rowRef)

  const avatars = useOverflowAvatars(users, maxAvatars)
  const minHeight = avatars.length === 0 ? 0 : size + sizeToHeightBump[size]
  return (
    <div
      ref={rowRef}
      className='relative flex w-full items-center'
      style={{
        marginLeft: size >= 40 ? -3 : -2,
        minHeight,
        transition: `min-height 100ms ${BezierCurve.DECELERATE}`
      }}
    >
      {avatars.length === 0 && emptyEl}
      <AnimatePresence initial={false}>
        {avatars.map((child, idx) => {
          const {id: userId} = child
          if ('overflowCount' in child) {
            const {overflowCount, displayIdx} = child
            return (
              <OverflowAvatar
                key={userId}
                offset={offsetSize * displayIdx}
                overflowCount={overflowCount}
                onClick={onOverflowClick}
                width={size}
                borderColor={borderColor}
              />
            )
          }
          return (
            <AvatarListUser
              key={userId}
              user={child}
              onClick={onUserClick ? () => onUserClick(userId) : undefined}
              offset={offsetSize * idx}
              className={`${size === 28 ? 'h-7 w-7' : size === 46 ? 'h-11.5 w-11.5' : ''}`}
              borderColor={borderColor}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default AvatarList
