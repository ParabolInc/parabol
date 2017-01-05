import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import Avatar from 'universal/components/Avatar/Avatar';
import Row from 'universal/components/Row/Row';
import UserTag from 'universal/components/UserTag/UserTag';
import AvatarPlaceholder from 'universal/components/AvatarPlaceholder/AvatarPlaceholder';

const UserRow = (props) => {
  const {
    actions,
    email,
    invitedAt,
    isAdmin,
    isLead,
    picture,
    preferredName,
    styles
  } = props;
  return (
    <Row>
      <div className={css(styles.userAvatar)}>
        {picture ?
          <Avatar hasBadge={false} picture={picture} size="small"/> :
          <AvatarPlaceholder/>
        }
      </div>
      <div className={css(styles.userInfo)}>
        {preferredName ?
          <div className={css(styles.nameAndTags)}>
            <div className={css(styles.preferredName)}>
              {preferredName}
            </div>
            {isLead &&
              <UserTag colorPalette="light" label="Lead" />
            }
            {isAdmin &&
              <UserTag colorPalette="gray" label="Admin" />
            }
          </div> :
          <div className={css(styles.nameAndTags)}>
            <div className={css(styles.preferredName)}>
              {email}
            </div>
          </div>
        }
        {invitedAt ?
          <div className={css(styles.invitedAt)}>
            {invitedAt}
          </div> :
          <a className={css(styles.infoLink)} href={`mailto:${email}`} title="Send an email">
            {email}
          </a>
        }
      </div>
      {actions &&
        <div className={css(styles.userActions)}>
          {actions}
        </div>
      }
    </Row>
  );
};

UserRow.propTypes = {
  actions: PropTypes.any,
  email: PropTypes.string,
  invitedAt: PropTypes.string,
  isAdmin: PropTypes.bool,
  isLead: PropTypes.bool,
  picture: PropTypes.string,
  preferredName: PropTypes.string,
  styles: PropTypes.object
};

UserRow.defaultProps = {
  email: 'email@domain.co'
};

const styleThunk = () => ({
  userAvatar: {
    // Define
  },

  userInfo: {
    paddingLeft: '1rem'
  },

  userActions: {
    flex: 1,
    textAlign: 'right'
  },

  nameAndTags: {
    // Define
  },

  preferredName: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontSize: appTheme.typography.s4,
    lineHeight: '1.625rem',
    verticalAlign: 'middle'
  },

  invitedAt: {
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4,
  },

  infoLink: {
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4,

    ':hover': {
      color: appTheme.palette.mid,
      textDecoration: 'underline'
    },
    ':focus': {
      color: appTheme.palette.mid,
      textDecoration: 'underline'
    }
  }
});

export default withStyles(styleThunk)(UserRow);
