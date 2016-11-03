import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Avatar from 'universal/components/Avatar/Avatar';
import UserTag from 'universal/components/UserTag/UserTag';

const UserRow = (props) => {
  const {
    actions,
    email,
    isAdmin,
    isLead,
    picture,
    preferredName,
    styles
  } = props;
  return (
    <div className={css(styles.userRow)}>
      <div className={css(styles.userAvatar)}>
        <Avatar hasBadge={false} picture={picture} size="small"/>
      </div>
      <div className={css(styles.userInfo)}>
        {preferredName &&
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
          </div>
        }
        {email &&
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
    </div>
  );
};

UserRow.propTypes = {
  actions: PropTypes.any,
  email: PropTypes.string,
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
  userRow: {
    alignItems: 'center',
    borderBottom: `1px solid ${appTheme.palette.mid20l}`,
    display: 'flex',
    padding: '1rem 0 1rem 1rem',
    width: '100%'
  },

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
