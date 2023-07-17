import styled from '@emotion/styled'
import {Edit as EditIcon} from '@mui/icons-material'
import React from 'react'
import {panelShadow} from '../../styles/elevation'
import {PALETTE} from '../../styles/paletteV3'
import Avatar from '../Avatar/Avatar'

const borderRadius = '50%'
const borderRadiusPanel = 4
const panelPadding = 8
const panelPaddingHorizontal = panelPadding * 2

const EditableAvatarRoot = styled('div')<Pick<Props, 'hasPanel'>>(({hasPanel}) => ({
  backgroundColor: hasPanel ? '#FFFFFF' : undefined,
  boxShadow: hasPanel ? panelShadow : undefined,
  borderRadius: hasPanel ? borderRadiusPanel : borderRadius,
  padding: hasPanel ? panelPadding : '',
  position: 'relative'
}))

const EditableAvatarEditOverlay = styled('div')<Pick<Props, 'hasPanel' | 'size'>>(({hasPanel}) => ({
  alignItems: 'center',
  backgroundColor: PALETTE.SLATE_400,
  borderRadius: hasPanel ? borderRadiusPanel : borderRadius,
  color: PALETTE.SLATE_800,
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  fontSize: 14,
  fontWeight: 600,
  height: '100%',
  justifyContent: 'center',
  left: 0,
  opacity: 0,
  padding: 4,
  position: 'absolute',
  top: 0,
  transition: 'all .3s ease-in-out',
  width: '100%',
  zIndex: 2,

  '&:hover': {
    opacity: 0.75
  }
}))

const EditableAvatarImgBlock = styled('div')<Pick<Props, 'hasPanel' | 'size'>>(
  ({hasPanel, size}) => ({
    height: hasPanel ? size - panelPaddingHorizontal : size,
    position: 'relative',
    width: hasPanel ? size - panelPaddingHorizontal : size,
    zIndex: 1
  })
)

interface Props {
  hasPanel?: boolean
  onClick?: () => void
  picture: string
  size: number
  unstyled?: boolean
}

const EditableAvatar = (props: Props) => {
  const {hasPanel, onClick, picture, size, unstyled} = props
  const avatarSize = hasPanel ? size - panelPaddingHorizontal : size
  return (
    <EditableAvatarRoot
      className='flex items-center justify-center rounded-full border-4 border-slate-200 outline-none duration-300 ease-in-out hover:cursor-pointer hover:border-slate-400 focus:border-sky-500'
      hasPanel={hasPanel}
      onClick={onClick}
      aria-label='click to update photo'
      tabIndex={0}
    >
      <div
        aria-hidden
        className='icon-wrapper absolute top-0 right-0 z-20 rounded-full bg-slate-200 px-1.5 hover:bg-slate-200'
      >
        <EditIcon className='mb-[-2px] w-3.5 pt-0.5' />
      </div>
      <EditableAvatarEditOverlay hasPanel={hasPanel} onClick={onClick} size={size}>
        <span>{'EDIT'}</span>
      </EditableAvatarEditOverlay>
      <EditableAvatarImgBlock hasPanel={hasPanel} size={size}>
        <Avatar picture={picture} size={avatarSize} sansRadius={unstyled} sansShadow={unstyled} />
      </EditableAvatarImgBlock>
    </EditableAvatarRoot>
  )
}

export default EditableAvatar
