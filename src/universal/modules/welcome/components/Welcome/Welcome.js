import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import {Link} from 'react-router-dom';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import ProgressDots from 'universal/modules/welcome/components/ProgressDots/ProgressDots';
import Step1PreferredName from 'universal/modules/welcome/components/Step1PreferredName/Step1PreferredName';
import Step2TeamName from 'universal/modules/welcome/components/Step2TeamName/Step2TeamName';
import Step3InviteTeam from 'universal/modules/welcome/components/Step3InviteTeam/Step3InviteTeam';
import WelcomeContent from 'universal/modules/welcome/components/WelcomeContent/WelcomeContent';
import WelcomeHeader from 'universal/modules/welcome/components/WelcomeHeader/WelcomeHeader';
import WelcomeLayout from 'universal/modules/welcome/components/WelcomeLayout/WelcomeLayout';
import withStyles from 'universal/styles/withStyles';

const Welcome = (props) => {
  const {progressDotClickFactory, styles, title, welcome: {page, completed}} = props;
  const headingText = page === 1 ? 'Hello!' : 'Invite your team';
  return (
    <WelcomeLayout>
      <Helmet title={title} />
      <WelcomeHeader heading={<span>{headingText}</span>} />
      <WelcomeContent>
        <ProgressDots
          numDots={3}
          numCompleted={completed}
          currentDot={page}
          clickFactory={progressDotClickFactory}
        />
        {page === 1 && <Step1PreferredName {...props} completed={completed} />}
        {page === 2 && <Step2TeamName {...props} completed={completed} />}
        {page === 3 && <Step3InviteTeam {...props} />}
      </WelcomeContent>
      <Link
        className={css(styles.signout)}
        title="Sign Out"
        to="/signout"
      >
        <FontAwesome
          name="sign-out"
        />
      </Link>
    </WelcomeLayout>
  );
};

Welcome.propTypes = {
  dispatch: PropTypes.func,
  invitees: PropTypes.array,
  inviteesRaw: PropTypes.string,
  preferredName: PropTypes.string,
  progressDotClickFactory: PropTypes.func,
  styles: PropTypes.object.isRequired,
  teamName: PropTypes.string,
  title: PropTypes.string,
  welcome: PropTypes.shape({
    completed: PropTypes.number,
    page: PropTypes.number,
    teamId: PropTypes.string,
    teamMemberId: PropTypes.string
  })
};

const styleThunk = () => ({
  signout: {
    alignSelf: 'flex-end'
  }
});
export default createFragmentContainer(
  withStyles(styleThunk)(Welcome),
  graphql`
    fragment Welcome_viewer on User {
      ...Step1PreferredName_viewer
    }
  `
);
