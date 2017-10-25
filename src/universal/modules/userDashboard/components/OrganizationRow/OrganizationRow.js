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
import withRouter from 'react-router-dom/es/withRouter';
import plural from 'universal/utils/plural';

const OrganizationRow = (props) => {
  const {
    history,
    organization: {
      id: orgId,
      isBillingLeader,
      name,
      orgUserCount: {
        activeUserCount,
        inactiveUserCount
      },
      picture,
      tier
    },
    styles
  } = props;
  const orgAvatar = picture || defaultOrgAvatar;
  const label = isBillingLeader ? 'Settings and Billing' : 'Create New Team';
  const onRowClickUrl = isBillingLeader ? `/me/organizations/${orgId}` : `/newteam/${orgId}`;
  const onRowClick = () => history.push(onRowClickUrl);
  const totalUsers = activeUserCount + inactiveUserCount;
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
            {`${totalUsers} ${plural(totalUsers, 'User')} (${activeUserCount} Active)`}
          </div>
        </div>
      </div>
      <div className={css(styles.orgActions)}>
        <Button
          buttonStyle="flat"
          colorPalette="dark"
          label={label}
          onClick={onRowClick}
          buttonSize="small"
        />
      </div>
    </Row>
  );
};

OrganizationRow.propTypes = {
  history: PropTypes.object.isRequired,
  organization: PropTypes.shape({
    id: PropTypes.string.isRequired,
    isBillingLeader: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    picture: PropTypes.string,
    tier: PropTypes.string.isRequired,
    orgUserCount: PropTypes.shape({
      activeUserCount: PropTypes.number.isRequired,
      inactiveUserCount: PropTypes.number.isRequired
    }).isRequired
  }).isRequired,
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

export default withRouter(withStyles(styleThunk)(OrganizationRow));
