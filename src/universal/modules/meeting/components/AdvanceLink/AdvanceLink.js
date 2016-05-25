import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import FontAwesome from 'react-fontawesome';
import tinycolor from 'tinycolor2';
import theme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;
const initialColor = theme.palette.warm;
const hoverColor = tinycolor(initialColor).darken(15).toString();
let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class AdvanceLink extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    href: PropTypes.string,
    onClick: PropTypes.func,
    icon: PropTypes.string,
    label: PropTypes.string
  }

  clickHandler = () => {
    const { disabled, onClick } = this.props;
    onClick(disabled);
  }

  render() {
    const { disabled, href, icon, label } = this.props;

    const disabledStyles = combineStyles(styles.link, styles.disabled);
    const linkStyles = disabled ? disabledStyles : styles.link;

    return (
      <a
        className={linkStyles}
        href={href}
        onClick={this.clickHandler}
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
    color: initialColor,
    cursor: 'pointer',
    fontFamily: theme.typography.serif,
    fontSize: theme.typography.s5,
    fontStyle: 'italic',
    fontWeight: 700,
    marginTop: '2rem',
    textDecoration: 'none',
    userSelect: 'none',

    // NOTE: Same styles for both :hover, :focus
    ':hover': {
      color: hoverColor,
      textDecoration: 'none'
    },
    ':focus': {
      color: hoverColor,
      textDecoration: 'none'
    }
  },

  // TODO: Create theme color options

  disabled: {
    cursor: 'not-allowed',
    opacity: '.5',

    // NOTE: Same styles for both :hover, :focus
    ':hover': {
      color: initialColor
    },
    ':focus': {
      color: initialColor
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
