/**
 * The sign-in page.
 *
 * @flow
 */
import React, {Component} from 'react';

import Header from './Header';
import SignIn from './SignIn';

type Credentials = {
  email: string,
  password: string
};

const containerStyles = {
  display: 'flex',
  flexDirection: 'column'
};

export default class SignInPage extends Component<*> {
  handleSubmitCredentials = ({email, password}: Credentials) => {
    console.log('email:', email);
    console.log('password:', password);
  };

  render() {
    return (
      <div style={containerStyles}>
        <Header />
        <SignIn
          authProviders={[{displayName: 'Google'}, {displayName: 'Hooli'}]}
          handleSubmitCredentials={this.handleSubmitCredentials}
        />
      </div>
    );
  }
}
