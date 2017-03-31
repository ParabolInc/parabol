import React, {Component, PropTypes} from 'react';
import {reduxForm, Field} from 'redux-form';
import InputField from 'universal/components/InputField/InputField';
import {cashay} from 'cashay';
import Button from 'universal/components/Button/Button';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import withStyles from 'universal/styles/withStyles';
import {withRouter} from 'react-router';

const styleThunk = () => ({
  errorMessage: {
    color: appTheme.palette.warm
  }
});

@withRouter
@withStyles(styleThunk)
@reduxForm({form: 'archiveTeamConfirmation'})
export default class ArchiveTeamConfirmation extends Component {

  static propTypes = {
    teamName: PropTypes.string.isRequired,
    teamId: PropTypes.string.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
    styles: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      showConfirmationField: false,
      showError: false
    };
  }

  archiveTeam = () => {
    const {teamId, router} = this.props;
    const variables = { teamId };
    cashay.mutate('archiveTeam', {variables});
    router.push('/me');
  }

  formSubmit = (data) => {
    const {teamName} = this.props;
    const {archivedTeamName} = data;
    if (teamName === archivedTeamName) {
      this.archiveTeam();
    } else {
      this.setState({showError: true});
    }
  }

  formBlurred = () => {
    this.setState({
      showConfirmationField: false,
      showError: false
    });
  }

  archiveTeamClick = () => {
    this.setState({showConfirmationField: true});
  }

  render() {
    const {handleSubmit, styles} = this.props;
    const {showConfirmationField, showError} = this.state;
    return (
      <div>
        {showError &&
          <div className={css(styles.errorMessage)}>
            The team name entered was incorrect
          </div>
        }
        {!showConfirmationField ?
          <Button
            colorPalette="warm"
            label="Archive Team"
            size="smallest"
            onClick={this.archiveTeamClick}
          /> :
          <form onSubmit={handleSubmit(this.formSubmit)}>
            <Field
              autoFocus
              onBlur={this.formBlurred}
              colorPalette="gray"
              component={InputField}
              name="archivedTeamName"
              placeholder="Type the team name to confirm"
              type="text"
            />
          </form>
        }
      </div>
    );
  }
}
