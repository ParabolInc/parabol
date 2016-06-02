import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class SectionHeader extends Component {
  static propTypes = {
    description: PropTypes.string,
    heading: PropTypes.string,
  }

  render() {
    const { heading, description } = this.props;

    return (
      <header className={styles.base}>
        <h2 className={styles.heading}>{heading}</h2>
        <p className={styles.description}>{description}</p>
      </header>
    );
  }
}

styles = StyleSheet.create({
  base: {
    margin: '8rem auto 2rem'
  },

  heading: {
    margin: '0 auto .5rem',
    padding: 0
  },

  description: {
    margin: 0,
    padding: 0
  },
});
