import React, {PropTypes} from 'react';
import ProgressDots from 'universal/modules/welcome/components/ProgressDots/ProgressDots';
import WelcomeContent from 'universal/modules/welcome/components/WelcomeContent/WelcomeContent';
import WelcomeHeader from 'universal/modules/welcome/components/WelcomeHeader/WelcomeHeader';
import WelcomeLayout from 'universal/modules/welcome/components/WelcomeLayout/WelcomeLayout';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {Link} from 'react-router';
import FontAwesome from 'react-fontawesome';
import Helmet from 'react-helmet';

import {
  Step1PreferredName,
  Step2TeamName,
  Step3InviteTeam
} from '../../components/WelcomeWizardForms';

const Welcome = (props) => {
  const {progressDotClickFactory, styles, title, welcome: {page, completed}} = props;
  const headingText = page === 1 ? 'Hello!' : 'Invite your team';
  return (
    <WelcomeLayout>
      <Helmet title={title} />
      <WelcomeHeader heading={<span>{headingText}</span>}/>
      <WelcomeContent>
        <ProgressDots
          numDots={3}
          numCompleted={completed}
          currentDot={page}
          clickFactory={progressDotClickFactory}
        />
        {page === 1 && <Step1PreferredName completed={completed} {...props}/>}
        {page === 2 && <Step2TeamName completed={completed} {...props}/>}
        {page === 3 && <Step3InviteTeam {...props}/>}
      </WelcomeContent>
      <Link
        className={css(styles.logout)}
        title="Sign Out"
        to="/logout"
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
  placeholderTheme: PropTypes.object,
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
  logout: {
    alignSelf: 'flex-end'
  }
});
export default withStyles(styleThunk)(Welcome);
