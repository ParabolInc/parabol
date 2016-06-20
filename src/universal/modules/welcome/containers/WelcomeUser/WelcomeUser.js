import React, {Component, PropTypes} from 'react';
import {setWelcomeName} from 'universal/modules/welcome/ducks/welcomeDuck';
import WelcomeUser from 'universal/modules/welcome/components/WelcomeUser/WelcomeUser';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {push} from 'react-router-redux';

@connect()
@reduxForm({form: 'fullNameForm'})
export default class WelcomeUserContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func
  };

  onSubmit = data => {
    const {dispatch} = this.props;
    const {fullName} = data;
    debugger
    dispatch(setWelcomeName(fullName));
    dispatch(push('/welcome-team-name'));
  };

  render() {
    return <WelcomeUser onSubmit={this.onSubmit} {...this.props} />;
  }
}
