import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import NewTeamForm from 'universal/modules/newTeam/components/NewTeamForm/NewTeamForm';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {PRICING_LINK} from 'universal/utils/externalLinks';

const NewTeam = (props) => {
  const {
    defaultOrgId,
    styles,
    viewer
  } = props;

  const {organizations} = viewer;
  const firstOrgId = organizations[0] && organizations[0].id;
  const orgId = organizations.find((org) => org.id === defaultOrgId) ? defaultOrgId : firstOrgId;
  return (
    <div className={css(styles.layout)}>
      <NewTeamForm
        defaultOrgId={defaultOrgId}
        initialValues={{orgId, isNewOrganization: String(!defaultOrgId)}}
        organizations={organizations}
      />
      <div className={css(styles.helpLayout)}>
        <div className={css(styles.helpBlock)}>
          <div className={css(styles.helpHeading)}>
            {'What’s an Organization?'}
          </div>
          <div className={css(styles.helpCopy)}>
            {`It’s the billing entity for a group of teams
            such as a company, non-profit, or
            for your personal use. Once created, you can
            create teams and invite others, even if they
            don't share your email domain.`}
          </div>
          <div className={css(styles.helpCopy)}>
            {'New Organizations start out on the '}
            <b>{'Free Personal Plan'}</b>{'.'}
          </div>
          <Button
            buttonSize="small"
            buttonStyle="flat"
            colorPalette="cool"
            icon="external-link-square"
            iconPlacement="right"
            label="Learn More"
            onClick={() => (window.open(PRICING_LINK, '_blank'))}
          />
        </div>
      </div>
    </div>
  );
};

NewTeam.propTypes = {
  defaultOrgId: PropTypes.string,
  styles: PropTypes.object,
  viewer: PropTypes.object.isRequired
};

const styleThunk = () => ({
  layout: {
    display: 'flex',
    minWidth: '60rem',
    width: '100%'
  },

  helpLayout: {
    paddingTop: '6.75rem'
  },

  helpBlock: {
    background: appTheme.palette.light50l,
    boxShadow: ui.shadow[1],
    color: appTheme.palette.dark,
    margin: '1rem 0',
    padding: '.75rem',
    textAlign: 'center',
    width: '16rem'
  },

  helpHeading: {
    fontSize: appTheme.typography.s4,
    fontWeight: 700,
    margin: 0
  },

  helpCopy: {
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.s4,
    margin: '.5rem 0'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(NewTeam),
  graphql`
    fragment NewTeam_viewer on User {
      organizations {
        id
        name
      }
    }
  `
);
