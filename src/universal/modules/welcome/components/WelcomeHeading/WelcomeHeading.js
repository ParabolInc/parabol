import React, {Component, PropTypes} from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';

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

styles = StyleSheet.create({
  root: {
    color: theme.palette.dark,
    display: 'block',
    fontSize: theme.typography.s6,
    fontWeight: 700,
    textAlign: 'center'
  }
});
