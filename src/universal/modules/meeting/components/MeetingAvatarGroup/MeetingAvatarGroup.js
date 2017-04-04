import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import {CHECKIN, UPDATES, phaseArray} from 'universal/utils/constants';
import Avatar from 'universal/components/Avatar/Avatar';
import Tag from 'universal/components/Tag/Tag';
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg';
import voidClick from 'universal/utils/voidClick';

const MeetingAvatarGroup = (props) => {
  const {
    avatars,
    facilitatorPhaseItem,
    gotoItem,
    localPhase,
    localPhaseItem,
    onFacilitatorPhase,
    styles
  } = props;
  const canNavigate = localPhase === CHECKIN || localPhase === UPDATES;
  return (
    <div className={css(styles.meetingAvatarGroupRoot)}>
      <div className={css(styles.meetingAvatarGroupInner)}>
        {
          avatars.map((avatar, idx) => {
            const picture = avatar.picture || defaultUserAvatar;
            const isFacilitating = avatar.isFacilitating;
            const count = idx + 1;
            const itemStyles = css(
              styles.item,
              !canNavigate && styles.itemReadOnly
            );
            const avatarBlockStyles = css(
              styles.avatarBlock,
              count === localPhaseItem && styles.avatarBlockLocal,
              count === facilitatorPhaseItem && onFacilitatorPhase && styles.avatarBlockFacilitator,
              !canNavigate && styles.avatarBlockReadOnly,
            );
            const tagBlockStyles = css(
              styles.tagBlock,
              !canNavigate && styles.tagBlockReadOnly
            );
            const handleClick = (e) => {
              if (canNavigate) {
                gotoItem(count);
              } else {
                voidClick(e);
              }
            };
            return (
              <div className={itemStyles} key={avatar.id}>
                <div className={avatarBlockStyles} onClick={(e) => handleClick(e)}>
                  <Avatar
                    {...avatar}
                    hasBadge
                    isActive={isFacilitating}
                    isClickable={canNavigate}
                    picture={picture}
                    size="fill"
                  />
                </div>
                {isFacilitating &&
                  <div className={tagBlockStyles}>
                    <Tag colorPalette="gray" label="Facilitator" />
                  </div>
                }
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

MeetingAvatarGroup.propTypes = {
  avatars: PropTypes.array,
  facilitatorPhaseItem: PropTypes.number,
  gotoItem: PropTypes.func.isRequired,
  localPhase: PropTypes.oneOf(phaseArray),
  localPhaseItem: PropTypes.number,
  onFacilitatorPhase: PropTypes.bool,
  styles: PropTypes.object
};

const borderDefault = appTheme.palette.mid20a;
const borderWarm = appTheme.palette.warm80a;
const borderLocal = appTheme.palette.dark;
const boxShadowBase = '0 0 0 3px #fff, 0 0 0 7px';
const boxShadowBorder = `${boxShadowBase} ${borderDefault}`;
const boxShadowWarm = `${boxShadowBase} ${borderWarm}`;
const boxShadowLocal = `${boxShadowBase} ${borderLocal}`;

const styleThunk = () => ({
  meetingAvatarGroupRoot: {
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: '.4375rem 0'
  },

  meetingAvatarGroupInner: {
    display: 'flex',
    position: 'relative',
    textAlign: 'center'
  },

  item: {
    marginLeft: '1.25rem',
    marginRight: '.4375rem',
    position: 'relative'
  },

  avatarBlock: {
    borderRadius: '100%',
    boxShadow: boxShadowBorder,
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

  itemReadOnly: {
    // marginRight: 0,
  },

  avatarBlockReadOnly: {
    boxShadow: ui.avatarDefaultBoxShadow,

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
    // bottom: '-1.3125rem'
  }
});

export default withStyles(styleThunk)(MeetingAvatarGroup);
