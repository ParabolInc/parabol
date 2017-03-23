import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import Avatar from 'universal/components/Avatar/Avatar';
import Tag from 'universal/components/Tag/Tag';
import {UPDATES} from 'universal/utils/constants';
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg';

const AvatarGroup = (props) => {
  const {localPhase, avatars, styles} = props;
  const label = localPhase === UPDATES ? 'Updates given:' : 'Team:';
  return (
    <div className={css(styles.root)}>
      <div className={css(styles.label)}>
        {label}
      </div>
      {
        avatars.map((avatar) => {
          const picture = avatar.picture || defaultUserAvatar;
          const isFacilitating = avatar.isFacilitating;
          return (
            <div className={css(styles.item)} key={avatar.id}>
              <Avatar
                {...avatar}
                picture={picture}
                forGroup
                hasBadge
                hasBorder
                isActive={isFacilitating}
                size="small"
              />
              {isFacilitating &&
                <div className={css(styles.tagBlock)}>
                  <Tag colorPalette="gray" label="Facilitator" />
                </div>
              }
            </div>
          );
        })
      }
    </div>
  );
};

AvatarGroup.propTypes = {
  localPhase: PropTypes.string,
  avatars: PropTypes.array,
  styles: PropTypes.object
};

// NOTE: outer padding for positioned label and overall centering
const outerPadding = '8rem';

const styleThunk = () => ({
  root: {
    fontSize: 0,
    padding: `0 ${outerPadding}`,
    position: 'relative',
    textAlign: 'center'
  },

  label: {
    color: appTheme.palette.mid,
    display: 'inline-block',
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    height: '2.75rem',
    left: 0,
    lineHeight: '2.75rem',
    minWidth: outerPadding,
    padding: '0 .75rem 0 0',
    position: 'absolute',
    textAlign: 'right',
    top: 0,
    verticalAlign: 'middle'
  },

  item: {
    display: 'inline-block',
    margin: '0 .75rem',
    position: 'relative',
    verticalAlign: 'top'
  },

  tagBlock: {
    bottom: '-1.5rem',
    left: '50%',
    paddingRight: ui.tagGutter,
    position: 'absolute',
    transform: 'translateX(-50%)'
  }
});

export default withStyles(styleThunk)(AvatarGroup);
