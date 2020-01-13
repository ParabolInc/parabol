import styled from '@emotion/styled'
import Icon from 'components/Icon'
import {PALETTE} from 'styles/paletteV2'
import {ICON_SIZE} from 'styles/typographyV2'
import PlainButton from 'components/PlainButton/PlainButton'
import React from 'react'
import lazyPreload from 'utils/lazyPreload'
import useMenu from 'hooks/useMenu'
import {MenuPosition} from 'hooks/useCoords'

const Button = styled(PlainButton)({})

const AddIcon = styled(Icon)({
  border: `1px solid ${PALETTE.BORDER_GRAY}`,
  borderRadius: 24,
  fontSize: ICON_SIZE.MD18,
  opacity: 0.5,
  padding: '4px 8px',
  ':hover': {
    opacity: 1
  }
})

const ReactjiPicker = lazyPreload(() =>
  import(
    /* webpackChunkName: 'ReactjiPicker' */
    '../ReactjiPicker'
  )
)

interface Props {
  onToggle: (emojiId: string) => void
}

const AddReactjiButton = (props: Props) => {
  const {onToggle} = props
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu(MenuPosition.UPPER_LEFT, {
    menuContentStyles: {paddingTop: 0, paddingBottom: 0}
  })

  return (
    <>
      <Button onClick={togglePortal} ref={originRef} onMouseEnter={ReactjiPicker.preload}>
        <AddIcon>{'sentiment_satisfied'}</AddIcon>
      </Button>
      {menuPortal(<ReactjiPicker menuProps={menuProps} onClick={onToggle} />)}
    </>
  )
}

export default AddReactjiButton
