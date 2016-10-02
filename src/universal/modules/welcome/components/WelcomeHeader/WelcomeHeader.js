import React, {Component, PropTypes} from 'react';
import look, { StyleSheet } from 'react-look';
import appTheme from 'universal/styles/theme/appTheme';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class WelcomeHeader extends Component {
  static propTypes = {
    heading: PropTypes.object
  }

  render() {
    return (
      <div className={styles.root}>
        <h1 className={styles.heading}>{this.props.heading}</h1>
      </div>
    );
  }
}

const styleThunk = () => ({
  root: {
    alignContent: 'center',
    backgroundColor: appTheme.palette.mid10l,
    borderBottom: `2px solid ${appTheme.palette.mid50l}`,
    display: 'flex !important',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '20vh',
    padding: '4rem',
    textAlign: 'center'
  },

  heading: {
    color: appTheme.palette.warm,
    fontFamily: appTheme.typography.serif,
    fontSize: '2rem',
    fontWeight: 700,
    margin: 0,
    padding: 0
  }
});
