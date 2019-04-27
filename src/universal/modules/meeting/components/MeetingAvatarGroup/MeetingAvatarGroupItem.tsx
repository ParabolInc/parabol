/* Deprecated! Temporary fix for MeetingAvatarGroup compliance with new menu */

import {css} from 'aphrodite-local-styles/no-important'
import React from 'react'
import Avatar from 'universal/components/Avatar/Avatar'
import Tag from 'universal/components/Tag/Tag'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import PromoteFacilitatorMutation from 'universal/mutations/PromoteFacilitatorMutation'
import RequestFacilitatorMutation from 'universal/mutations/RequestFacilitatorMutation'
import appTheme from 'universal/styles/theme/appTheme'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import ui from 'universal/styles/ui'
import withStyles from 'universal/styles/withStyles'
import {CHECKIN, UPDATES} from 'universal/utils/constants'
import lazyPreload from 'universal/utils/lazyPreload'

const MeetingAvatarMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'MeetingAvatarMenu' */
  'universal/modules/meeting/components/MeetingAvatarMenu')
)

interface Props {
  avatar: any
  idx: number
  styles: any
  team: any
  localPhase: any
  localPhaseItem: any
  gotoItem: (count: any) => void
  isFacilitating: boolean
}

const MeetingAvatarGroupItem = (props: Props) => {
  const {team, avatar, idx, styles, localPhase, localPhaseItem, gotoItem, isFacilitating} = props
  const {activeFacilitator, teamId, facilitatorPhase, facilitatorPhaseItem} = team
  const onFacilitatorPhase = facilitatorPhase === localPhase
  const canNavigate = localPhase === CHECKIN || localPhase === UPDATES
  const atmosphere = useAtmosphere()
  const {togglePortal, originRef, menuPortal, closePortal} = useMenu(MenuPosition.UPPER_RIGHT)
  const {isConnected, isSelf} = avatar
  const picture = avatar.picture || defaultUserAvatar
  const count = idx + 1
  const itemStyles = css(styles.item, !canNavigate && styles.itemReadOnly)
  const avatarBlockStyles = css(
    styles.avatarBlock,
    count === localPhaseItem && styles.avatarBlockLocal,
    count === facilitatorPhaseItem && onFacilitatorPhase && styles.avatarBlockFacilitator,
    !canNavigate && styles.avatarBlockReadOnly
  )
  const tagBlockStyles = css(styles.tagBlock, !canNavigate && styles.tagBlockReadOnly)
  const navigateTo = () => {
    gotoItem(count)
  }
  const promoteToFacilitator = () => {
    PromoteFacilitatorMutation(atmosphere, {facilitatorId: avatar.id}, {}, undefined, undefined)
  }
  const requestFacilitator = () => {
    RequestFacilitatorMutation(atmosphere, teamId)
  }
  const avatarIsFacilitating = activeFacilitator === avatar.id
  const handleNavigate = (canNavigate && navigateTo) || undefined
  const handlePromote =
    (isFacilitating && !isSelf && isConnected && promoteToFacilitator) || undefined
  const handleRequest = (avatarIsFacilitating && !isSelf && requestFacilitator) || undefined
  return (
    <div className={itemStyles} key={avatar.id}>
      <div className={avatarBlockStyles}>
        <Avatar
          hasBadge
          isClickable
          picture={picture}
          isConnected={avatar.isConnected || avatar.isSelf}
          isCheckedIn={avatar.isCheckedIn}
          size='fill'
          onClick={togglePortal}
          innerRef={originRef}
        />
      </div>
      {avatarIsFacilitating && (
        <div className={tagBlockStyles}>
          <Tag colorPalette='gray' label='Facilitator' />
        </div>
      )}
      {menuPortal(
        <MeetingAvatarMenu
          handleNavigate={handleNavigate}
          handlePromote={handlePromote}
          handleRequest={handleRequest}
          avatar={avatar}
          localPhase={localPhase}
          closePortal={closePortal}
        />
      )}
    </div>
  )
}

const borderActive = appTheme.brand.secondary.yellow
const borderLocal = appTheme.palette.mid30l
const boxShadowBase = '0 0 0 2px #fff, 0 0 0 4px'
const boxShadowWarm = `${boxShadowBase} ${borderActive}`
const boxShadowLocal = `${boxShadowBase} ${borderLocal}`

const styleThunk = () => ({
  meetingAvatarGroupRoot: {
    alignItems: 'flex-end',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: '1rem 0'
  },

  meetingAvatarGroupInner: {
    display: 'flex',
    position: 'relative',
    textAlign: 'center'
  },

  item: {
    marginLeft: '1rem',
    marginRight: '.25rem',
    position: 'relative'
  },

  itemReadOnly: {
    // Define
  },

  avatarBlock: {
    borderRadius: '100%',
    width: '2.25rem',

    [ui.breakpoint.wide]: {
      width: '2.5rem'
    },
    [ui.breakpoint.wider]: {
      width: '3rem'
    },
    [ui.breakpoint.widest]: {
      width: '4rem'
    },

    ':hover': {
      opacity: '.5'
    }
  },

  avatarBlockLocal: {
    boxShadow: boxShadowLocal
  },

  avatarBlockFacilitator: {
    boxShadow: boxShadowWarm
  },

  avatarBlockReadOnly: {
    boxShadow: 'none',

    ':hover': {
      opacity: '1'
    }
  },

  tagBlock: {
    bottom: '-1.75rem',
    left: '50%',
    paddingRight: ui.tagGutter,
    position: 'absolute',
    transform: 'translateX(-50%)'
  },

  tagBlockReadOnly: {
    // Define
  }
})

export default withStyles(styleThunk)(MeetingAvatarGroupItem)
