import React, {Component, PropTypes} from 'react';
import look, { StyleSheet } from 'react-look';
import appTheme from 'universal/styles/theme/appTheme';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class WelcomeHeading extends Component {
  static propTypes = {
    copy: PropTypes.object
  }

  render() {
    return (
      <h2 className={styles.root}>
        {this.props.copy}
      </h2>
    );
  }
}

const styleThunk = () => ({
  root: {
    color: appTheme.palette.dark,
    display: 'block',
    fontSize: appTheme.typography.s6,
    fontWeight: 700,
    textAlign: 'center'
  }
});
