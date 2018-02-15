/**
 * The sign-in page.
 *
 * @flow
 */
import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import Button from 'universal/components/Button/Button';
import parabolLogo from 'universal/styles/theme/images/brand/parabol-beta-lockup.svg';
import appTheme from 'universal/styles/theme/appTheme';

type AuthProvider = {
  iconSrc?: string,
  displayName: string
};

const containerStyles = {
  display: 'flex',
  flexDirection: 'column'
};

const headerStyles = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  height: '4rem',
  width: '100%',
  backgroundColor: appTheme.brand.greyBlue,
  color: 'white',
  fontFamily: appTheme.typography.sansSerif
};

const headerBrandStyles = {
  paddingLeft: '1rem'
};

const Header = () => (
  <div style={headerStyles}>
    <div style={headerBrandStyles}>
      <Link to="/" title="Parabol Home">
        <img src={parabolLogo} alt="" />
      </Link>
    </div>
  </div>
);

const signInContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  fontFamily: appTheme.typography.sansSerif
};

const SignInWithProvider = ({provider}: {provider: AuthProvider}) => {
  const label = `Sign in with ${provider.displayName}`;
  return (
    <div style={{paddingTop: '.5rem'}}>
      <Button
        type="button"
        title={label}
        label={label}
        icon={provider.iconSrc}
        iconPlacement="left"
        colorPalette="gray"
      />
    </div>
  );
};

const separatorStyles = {
  padding: '1rem 0 1rem 0',
  display: 'flex',
  flexDirection: 'row'
};

const separatorLineStyles = {
  margin: 'auto',
  width: '10rem',
  borderBottom: `1px solid ${appTheme.palette.mid}`
};

const separatorLineLeftStyles = {
  ...separatorLineStyles,
  marginRight: '0.5rem'
};

const separatorLineRightStyles = {
  ...separatorLineStyles,
  marginLeft: '0.5rem'
};

const Separator = () => (
  <div style={separatorStyles}>
    <div style={separatorLineLeftStyles} />
    or
    <div style={separatorLineRightStyles} />
  </div>
);

const formStyles = {
  display: 'flex',
  flexDirection: 'column'
};

const labelledInputStyles = {
  display: 'flex',
  flexDirection: 'column',
  fontSize: '.75rem'
};

const inputWrapperStyles = {
  marginBottom: '2rem'
};

class SignInEmailPasswordForm extends Component {
  render() {
    return (
      <form style={formStyles}>
        <div style={inputWrapperStyles}>
          <label style={labelledInputStyles}>
            Email:
            <input type="email" placeholder="you@company.co" />
          </label>
          <label style={labelledInputStyles}>
            Password:
            <input type="password" placeholder="********" />
          </label>
        </div>
        <Link to="/reset-password">Forgot your password?</Link>
        <Button
          type="submit"
          label="Sign In"
          title="Sign In"
          colorPalette="warm"
        />
      </form>
    );
  }
}

const SignIn = ({authProviders}: {authProviders: Array<AuthProvider>}) => (
  <div style={signInContainerStyles}>
    <h1>Sign In</h1>
    <h2>or <Link to="/signup">Sign Up</Link></h2>
    {authProviders.map((provider) => (
      <SignInWithProvider key={provider.displayName} provider={provider} />
    ))}
    <Separator />
    <SignInEmailPasswordForm />
  </div>
);

export default () => (
  <div style={containerStyles}>
    <Header />
    <SignIn authProviders={[{displayName: 'Google'}, {displayName: 'Hooli'}]} />
  </div>
);
