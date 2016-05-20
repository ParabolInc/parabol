import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import FontAwesome from 'react-fontawesome';
import tinycolor from 'tinycolor2';
import theme from 'universal/styles/theme';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class AdvanceLink extends Component {
  static propTypes = {
    href: PropTypes.string,
    onClick: PropTypes.func,
    icon: PropTypes.string,
    label: PropTypes.string
  }

  render() {
    const { href, icon, label, onClick } = this.props;

    return (
      <a
        className={styles.link}
        href={href}
        onClick={onClick}
        title={label}
      >
        {label}
        <FontAwesome
          className={styles.icon}
          name={icon}
        />
      </a>
    );
  }
}

styles = StyleSheet.create({
  link: {
    color: theme.palette.b,
    cursor: 'pointer',
    fontFamily: theme.typography.actionUISerif,
    fontSize: theme.typography.fs5,
    fontStyle: 'italic',
    fontWeight: 700,
    marginTop: '2rem',
    textDecoration: 'none',

    // NOTE: Same styles for both :hover, :focus
    ':hover': {
      color: tinycolor(theme.palette.b).darken(15).toString(),
      textDecoration: 'none'
    },
    ':focus': {
      color: tinycolor(theme.palette.b).darken(15).toString(),
      textDecoration: 'none'
    }
  },

  // NOTE: Custom styles are conflicting with .fa classes, hence #shame !important
  icon: {
    color: 'inherit',
    display: 'inline-block !important',
    fontSize: '28px !important',
    margin: '-.125rem 0 0 .5rem',
    verticalAlign: 'middle'
  }
});
