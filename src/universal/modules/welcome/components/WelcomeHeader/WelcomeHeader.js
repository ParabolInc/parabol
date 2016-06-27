import React, {Component, PropTypes} from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';

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

styles = StyleSheet.create({
  root: {
    alignContent: 'center',
    backgroundColor: theme.palette.mid10l,
    borderBottom: `2px solid ${theme.palette.mid50l}`,
    display: 'flex !important',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '20vh',
    padding: '4rem',
    textAlign: 'center'
  },

  heading: {
    color: theme.palette.warm,
    fontFamily: theme.typography.serif,
    fontSize: '2rem',
    fontWeight: 700,
    margin: 0,
    padding: 0
  }
});
