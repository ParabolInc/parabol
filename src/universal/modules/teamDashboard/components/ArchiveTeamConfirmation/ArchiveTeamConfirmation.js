import React, {Component, PropTypes} from 'react';
import {reduxForm, Field} from 'redux-form';
import InputField from 'universal/components/InputField/InputField';
import {cashay} from 'cashay';
import Button from 'universal/components/Button/Button';
import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';


const styleThunk = () => ({
  archiveTeamConfirmation: {
    marginLeft: '66px'
  }
});

@withStyles(styleThunk)
@reduxForm({form: 'archiveTeamConfirmation'})

export default class ArchiveTeamConfirmation extends Component {

  static propTypes = {
    teamName: PropTypes.string.isRequired,
    teamId: PropTypes.string.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
    styles: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {showConfirmationField: false};
  }

  archiveTeam = () => {
    const {teamName, teamId, router} = this.props;
    const variables = {
      updatedTeam: {
        id: teamId,
        name: teamName,
        isArchived: true
      }
    };
    cashay.mutate('archiveTeam', {variables});
    router.push('/me');
  }

  formSubmit = (data) => {
    const {teamName} = this.props;
    const {archivedTeamName} = data;
    if (teamName === archivedTeamName) {
      this.archiveTeam();
    } else {
      this.setState({showConfirmationField: false});
    }
  }

  archiveTeamClick = () => {
    this.setState({showConfirmationField: true});
  }

  render() {
    const {handleSubmit, styles} = this.props;
    const {showConfirmationField} = this.state;
    return (
      <div className={css(styles.archiveTeamConfirmation)}>
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
