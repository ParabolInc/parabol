import React, {Component, PropTypes} from 'react';
import {reduxForm, Field} from 'redux-form';
import InputField from 'universal/components/InputField/InputField';
import {cashay} from 'cashay';
import Button from 'universal/components/Button/Button';

@reduxForm({form: 'archiveTeamConfirmation'})
export default class ArchiveTeamConfirmation extends Component {

  static propTypes = {
    teamId: PropTypes.string.isRequired,
    teamName: PropTypes.string.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {showConfirmationField: false};
  }

  archiveTeamClick = () => {
    this.setState({showConfirmationField: true});
  }

  validate = (value) => {
    const {teamName} = this.props;
    return teamName !== value && 'The team name entered was incorrect';
  }

  archiveTeam = () => {
    const {teamId, router} = this.props;
    const variables = {teamId};
    cashay.mutate('archiveTeam', {variables});
    router.push('/me');
  }

  formBlurred = () => {
    this.setState({showConfirmationField: false});
  }

  render() {
    const {handleSubmit} = this.props;
    const {showConfirmationField} = this.state;
    return (
      <div>
        {!showConfirmationField ?
          <Button
            colorPalette="warm"
            label="Archive Team"
            size="smallest"
            onClick={this.archiveTeamClick}
          /> :
          <form onSubmit={handleSubmit(this.archiveTeam)}>
            <Field
              autoFocus
              onBlur={this.formBlurred}
              colorPalette="gray"
              component={InputField}
              name="archivedTeamName"
              placeholder="Type the team name to confirm"
              type="text"
              validate={this.validate}
            />
          </form>
        }
      </div>
    );
  }
}
