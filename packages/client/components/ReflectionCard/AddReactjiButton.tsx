import styled from '@emotion/styled'
import React from 'react'
import PlainButton from '~/components/PlainButton/PlainButton'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import lazyPreload from '~/utils/lazyPreload'

const icon = `${__STATIC_IMAGES__}/icons/add_reactji_24.svg`

const Button = styled(PlainButton)({
  display: 'block',
  height: 24,
  lineHeight: '24px',
  opacity: 0.5,
  padding: '3px 0',
  width: 24,
  ':hover, :focus': {
    opacity: 1
  }
})

const AddIcon = styled('img')({
  height: 18,
  width: 18
})

const ReactjiPicker = lazyPreload(() =>
  import(
    /* webpackChunkName: 'ReactjiPicker' */
    '../ReactjiPicker'
  )
)

interface Props {
  className?: string
  onToggle: (emojiId: string) => void
}

const AddReactjiButton = (props: Props) => {
  const {className, onToggle} = props
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu(MenuPosition.UPPER_LEFT, {
    menuContentStyles: {paddingTop: 0, paddingBottom: 0}
  })

  return (
    <>
      <Button
        className={className}
        onClick={togglePortal}
        ref={originRef}
        onMouseEnter={ReactjiPicker.preload}
      >
        <AddIcon alt='' src={icon} />
      </Button>
      {menuPortal(<ReactjiPicker menuProps={menuProps} onClick={onToggle} />)}
    </>
  )
}

export default AddReactjiButton
