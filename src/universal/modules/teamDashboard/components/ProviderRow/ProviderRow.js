import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import ConditionalLink from 'universal/components/ConditionalLink/ConditionalLink';
import Row from 'universal/components/Row/Row';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {GITHUB, GITHUB_SCOPE, SLACK, SLACK_SCOPE} from 'universal/utils/constants';
import makeHref from 'universal/utils/makeHref';

export const providerLookup = {
  [GITHUB]: {
    ...ui.providers.github,
    route: 'github',
    makeUri: (jwt, teamId) => {
      // const redirect = makeHref('/auth/github/entry');
      const state = `${teamId}::${jwt}`;
      // eslint-disable-next-line
      return `https://github.com/login/oauth/authorize?client_id=${window.__ACTION__.github}&scope=${GITHUB_SCOPE}&state=${state}`
    }
  },
  [SLACK]: {
    ...ui.providers.slack,
    route: 'slack',
    makeUri: (jwt, teamId) => {
      const redirect = makeHref('/auth/slack');
      // state is useful for CSRF, but we jwt to make sure the person isn't overwriting the int for another team
      const state = `${teamId}::${jwt}`;
      // eslint-disable-next-line
      return `https://slack.com/oauth/authorize?client_id=${window.__ACTION__.slack}&scope=${SLACK_SCOPE}&state=${state}&redirect_uri=${redirect}`;
    }
  }
};

const defaultDetails = {
  userCount: 0,
  integrationCount: 0
};

const ProviderRow = (props) => {
  const {
    comingSoon,
    history,
    jwt,
    name,
    providerDetails,
    styles,
    teamId
  } = props;
  const {
    accessToken,
    userCount,
    integrationCount
    // providerUserName
  } = providerDetails || defaultDetails;
  const {color, icon, description, makeUri, providerName, route} = providerLookup[name];
  const openOauth = () => {
    const uri = makeUri(jwt, teamId);
    window.open(uri);
  };
  const linkStyle = {
    display: 'block',
    textDecoration: 'none'
  };
  const to = `/team/${teamId}/settings/integrations/${route}`;
  const metaIconStyle = {
    display: 'inline-block',
    fontSize: ui.iconSize,
    fontWeight: 400
  };
  const hasActivity = userCount > 0 || integrationCount > 0;
  return (
    <Row style={{justifyContent: 'flex-start'}}>
      <ConditionalLink isLink={!comingSoon} to={to} style={linkStyle}>
        <div className={css(styles.providerAvatar)} style={{backgroundColor: color}}>
          <FontAwesome name={icon} className={css(styles.providerIcon)} />
        </div>
      </ConditionalLink>
      <div className={css(styles.userInfo)}>
        <ConditionalLink isLink={!comingSoon} to={to} className={css(styles.providerRowContent)}>
          <div className={css(styles.nameAndMeta)}>
            <div className={css(styles.providerName)}>
              {providerName}
              {hasActivity &&
                <div className={css(styles.providerMeta)}>
                  <div className={css(styles.providerMetaItem)}>
                    <FontAwesome name="user-circle" style={metaIconStyle} /> {userCount}
                  </div>
                  <div className={css(styles.providerMetaItem)}>
                    <FontAwesome name={icon} style={metaIconStyle} /> {integrationCount}
                  </div>
                </div>
              }
            </div>
          </div>
          <div className={css(styles.subHeading)}>
            {comingSoon &&
            <span className={css(styles.comingSoon)}>Coming Soon! </span>
            }
            {description}
          </div>
        </ConditionalLink>
      </div>
      {!comingSoon &&
      <div className={css(styles.providerActions)}>
        {accessToken ?
          <Button
            buttonSize="small"
            buttonStyle="solid"
            colorPalette="gray"
            isBlock
            key="teamSettings"
            label="Team Settings"
            onClick={() => history.push(to)}
          /> :
          <Button
            buttonSize="small"
            buttonStyle="solid"
            colorPalette="cool"
            isBlock
            key="linkAccount"
            label="Link My Account"
            onClick={openOauth}
          />
        }
      </div>
      }
    </Row>
  );
};


ProviderRow.propTypes = {
  actions: PropTypes.any,
  comingSoon: PropTypes.bool,
  history: PropTypes.object,
  jwt: PropTypes.string,
  name: PropTypes.string,
  providerDetails: PropTypes.object,
  teamId: PropTypes.string.isRequired,
  styles: PropTypes.object
};

const styleThunk = () => ({
  comingSoon: {
    fontWeight: 700
  },

  providerAvatar: {
    borderRadius: ui.providerIconBorderRadius
  },

  providerIcon: {
    alignItems: 'center',
    color: '#fff',
    display: 'flex !important',
    fontSize: `${ui.iconSize2x} !important`,
    height: ui.providerIconSize,
    justifyContent: 'center',
    width: ui.providerIconSize
  },

  userInfo: {
    paddingLeft: '1rem'
  },

  userActions: {
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end'
  },

  providerRowContent: {
    display: 'block',
    color: ui.providerName.color,

    ':hover': {
      color: ui.providerName.color
    },
    ':focus': {
      color: ui.providerName.color
    }
  },

  nameAndMeta: {
    display: 'flex',
    alignItems: 'center'
  },

  providerMeta: {
    color: appTheme.palette.mid,
    display: 'inline-block',
    fontSize: 0,
    height: '1rem',
    lineHeight: appTheme.typography.s3,
    padding: '0 0 .125rem 1.5rem',
    verticalAlign: 'middle'
  },

  providerMetaItem: {
    display: 'inline-block',
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    marginRight: ui.rowGutter
  },

  providerName: {
    ...ui.providerName,
    display: 'inline-block',
    marginRight: ui.rowGutter,
    verticalAlign: 'middle'
  },

  providerActions: {
    flex: 1,
    marginLeft: 'auto',
    paddingLeft: ui.rowGutter,
    textAlign: 'right',
    maxWidth: '10rem'
  },

  invitedAt: {
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4
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
  },
  subHeading: {
    ...ui.rowSubheading
  }
});

export default createFragmentContainer(
  withRouter(withStyles(styleThunk)(ProviderRow)),
  graphql`
    fragment ProviderRow_providerDetails on ProviderRow {
      accessToken
      integrationCount
      userCount
    }
  `
);
