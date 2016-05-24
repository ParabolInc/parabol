import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class ExampleCode extends Component {
  static propTypes = {
    children: PropTypes.any
  }

  render() {
    return (
      <div className={styles.base}>
        <pre className={styles.pre}>
          {this.props.children}
        </pre>
      </div>
    );
  }
}

styles = StyleSheet.create({
  base: {
    backgroundColor: '#222',
    color: '#fff',
    margin: '2rem auto 0',
    padding: '1rem 2rem'
  },

  pre: {
    fontFamily: theme.typography.actionUIMonospace,
    fontSize: '1.125rem',
    fontWeight: 700
  }
});
