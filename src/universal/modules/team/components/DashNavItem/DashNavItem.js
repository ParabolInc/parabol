import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;
let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class DashNavItem extends Component {

  static propTypes = {
    active: PropTypes.bool,
    label: PropTypes.string
  }

  render() {
    const activeStyles = combineStyles(styles.root, styles.active);
    const itemStyles = this.props.active ? activeStyles : styles.root;

    return (
      <div className={itemStyles} title={this.props.label}>
        {this.props.label}
      </div>
    );
  }
}

styles = StyleSheet.create({
  root: {
    backgroundColor: 'transparent',
    borderRadius: '.25rem 0 0 .25rem',
    fontSize: theme.typography.s4,
    padding: '.3125rem .5rem .3125rem 1rem',

    ':hover': {
      backgroundColor: theme.palette.dark50a,
      cursor: 'pointer'
    },
    ':focus': {
      backgroundColor: theme.palette.dark50a,
      cursor: 'pointer'
    }
  },

  active: {
    backgroundColor: theme.palette.dark,

    ':hover': {
      backgroundColor: theme.palette.dark,
      cursor: 'default'
    },
    ':focus': {
      backgroundColor: theme.palette.dark,
      cursor: 'default'
    }
  }
});
