import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import NewTeamForm from 'universal/modules/newTeam/components/NewTeamForm/NewTeamForm';

const NewTeam = (props) => {
  const {
    isNewOrg,
    styles,
    viewer
  } = props;

  const {organizations} = viewer;
  const firstOrgId = organizations[0] && organizations[0].id;
  return (
    <div className={css(styles.layout)}>
      <NewTeamForm initialValues={{orgId: firstOrgId, isNewOrganization: String(isNewOrg)}} organizations={organizations}/>
      <div className={css(styles.helpLayout)}>
        <div className={css(styles.helpBlock)}>
          <div className={css(styles.helpHeading)}>
            {'What’s an Organization?'}
          </div>
          <div className={css(styles.helpCopy)}>
            {`Every Team belongs to an Organization.
                New Organizations start out on the `}
            <b>{'Free Personal Plan'}</b>{'.'}
          </div>
          <Button
            buttonSize="small"
            buttonStyle="flat"
            colorPalette="cool"
            icon="external-link-square"
            iconPlacement="right"
            label="Learn More"
            onClick={() => console.log('TODO: Link to Pricing Page')}
          />
        </div>
      </div>
    </div>
  );
};

NewTeam.propTypes = {
  isNewOrg: PropTypes.bool.isRequired,
  styles: PropTypes.object,
  viewer: PropTypes.object.isRequired
};

const styleThunk = () => ({
  layout: {
    display: 'flex',
    width: '100%'
  },

  form: {
    margin: 0,
    maxWidth: '40rem',
    padding: '.5rem 2rem',
    width: '100%'
  },

  formInner: {
    borderTop: `.0625rem solid ${ui.panelBorderColor}`,
    padding: '2rem'
  },

  formBlock: {
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'space-between',
    margin: '0 auto 1rem',
    width: '100%'
  },

  formBlockInline: {
    marginTop: '3rem'
  },

  fieldBlock: {
    width: '16rem'
  },

  textAreaBlock: {
    margin: '2rem auto'
  },

  buttonBlock: {
    margin: '0 auto',
    width: '16rem'
  },

  helpLayout: {
    paddingTop: '6.75rem'
  },

  helpBlock: {
    background: appTheme.palette.light50l,
    boxShadow: ui.shadow[0],
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
