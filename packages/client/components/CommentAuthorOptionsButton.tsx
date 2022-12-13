import styled from '@emotion/styled'
import {MoreVert} from '@mui/icons-material'
import React from 'react'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {PALETTE} from '~/styles/paletteV3'
import lazyPreload from '~/utils/lazyPreload'
import PlainButton from './PlainButton/PlainButton'

const CommentAuthorOptionsDropdown = lazyPreload(
  () =>
    import(/* webpackChunkName: 'CommentAuthorOptionsDropdown' */ './CommentAuthorOptionsDropdown')
)

const StyledButton = styled(PlainButton)({
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700
  }
})

const StyledIconWrapper = styled('div')({
  borderRadius: 24,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'inherit',
  flexShrink: 0,
  height: 24,
  lineHeight: '24px',
  marginLeft: 'auto',
  width: 24
})

const StyledIcon = styled(MoreVert)({
  height: 18,
  width: 18
})

interface Props {
  commentId: string
  editComment: () => void
  dataCy: string
  meetingId: string
}

const CommentAuthorOptionsButton = (props: Props) => {
  const {commentId, editComment, dataCy, meetingId} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  return (
    <StyledButton
      data-cy={`${dataCy}-dropdown-menu`}
      onMouseEnter={CommentAuthorOptionsDropdown.preload}
      ref={originRef}
      onClick={togglePortal}
    >
      <StyledIconWrapper>
        <StyledIcon />
      </StyledIconWrapper>
      {menuPortal(
        <CommentAuthorOptionsDropdown
          menuProps={menuProps}
          commentId={commentId}
          editComment={editComment}
          meetingId={meetingId}
        />
      )}
    </StyledButton>
  )
}

export default CommentAuthorOptionsButton
