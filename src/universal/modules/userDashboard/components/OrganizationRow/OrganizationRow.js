import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'universal/components/Button/Button';
import Row from 'universal/components/Row/Row';
import {tagBlock} from 'universal/components/Tag/tagBase';
import TagPro from 'universal/components/Tag/TagPro';
import appTheme from 'universal/styles/theme/appTheme';
import defaultOrgAvatar from 'universal/styles/theme/images/avatar-organization.svg';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {PRO} from 'universal/utils/constants';

const OrganizationRow = (props) => {
  const {
    organization: {
      name,
      orgUserCount: {
        activeUserCount,
        inactiveUserCount
      },
      picture,
      tier
    },
    onRowClick,
    styles
  } = props;
  const orgAvatar = picture || defaultOrgAvatar;
  return (
    <Row>
      <div className={css(styles.orgAvatar)} onClick={onRowClick}>
        <img className={css(styles.avatarImg)} height={50} width={50} src={orgAvatar} />
      </div>
      <div className={css(styles.orgInfo)}>
        <div className={css(styles.nameAndTags)}>
          <div className={css(styles.name)} onClick={onRowClick}>
            {name}
            {tier === PRO &&
            <div className={css(styles.tagBlock)}>
              <TagPro />
            </div>
            }
          </div>
          <div className={css(styles.subHeader)}>
            {activeUserCount + inactiveUserCount}{' Users ('}{activeUserCount}{' Active)'}
          </div>
        </div>
      </div>
      <div className={css(styles.orgActions)}>
        <Button
          buttonStyle="flat"
          colorPalette="dark"
          label="Settings and Billing"
          onClick={onRowClick}
          size="smallest"
        />
      </div>
    </Row>
  );
};

OrganizationRow.propTypes = {
  actions: PropTypes.any,
  email: PropTypes.string,
  invitedAt: PropTypes.string,
  isAdmin: PropTypes.bool,
  isLead: PropTypes.bool,
  isPaid: PropTypes.bool,
  onRowClick: PropTypes.func,
  organization: PropTypes.object,
  picture: PropTypes.string,
  name: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  orgAvatar: {
    cursor: 'pointer'
  },

  orgInfo: {
    paddingLeft: '1rem'
  },

  orgActions: {
    flex: 1,
    marginLeft: ui.rowGutter,
    textAlign: 'right'
  },

  nameAndTags: {
    // Define
  },

  name: {
    color: appTheme.palette.dark,
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: appTheme.typography.s4,
    lineHeight: '1.625rem',
    verticalAlign: 'middle'
  },

  invitedAt: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4
  },

  infoLink: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4,

    ':hover': {
      color: appTheme.palette.dark
    },
    ':focus': {
      color: appTheme.palette.dark
    }
  },

  subHeader: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4
  },

  tagBlock: {
    ...tagBlock,
    marginLeft: '.125rem',
    marginTop: '-.5rem'
  }
});

export default withStyles(styleThunk)(OrganizationRow);
