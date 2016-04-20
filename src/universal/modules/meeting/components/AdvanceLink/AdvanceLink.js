import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import FontAwesome from 'react-fontawesome';
import tinycolor from 'tinycolor2';
import theme from 'universal/styles/theme/theme';

@look
export default class AdvanceLink extends Component {
  static propTypes = {
    href: PropTypes.string,
    icon: PropTypes.string,
    label: PropTypes.string
  }

  render() {
    const { href, icon, label } = this.props;

    return (
      <a className={styles.advanceLink} href={href} title={label}>
        {label}
        <FontAwesome
          className={styles.advanceLinkIcon}
          name={icon}
        />
      </a>
    );
  }
}

const styles = StyleSheet.create({
  advanceLink: {
    color: theme.b,
    // TODO: fontFamily: $action-ui-serif;
    fontFamily: 'Merriweather, Georgia, "Times New Roman", Times, serif',
    // TODO: fontSize: $fs5;
    fontSize: '20px',
    fontStyle: 'italic',
    fontWeight: 700,
    marginTop: '2rem',
    textDecoration: 'none',

    ":hover": {
      color: tinycolor(theme.b).darken(15),
      textDecoration: 'none'
    },

    ":focus": {
      color: tinycolor(theme.b).darken(15),
      textDecoration: 'none'
    }
  },

  // TODO: custom styles are conflicting with .fa classes, hence !important
  advanceLinkIcon: {
    color: 'inherit',
    display: 'inline-block !important',
    fontSize: '28px !important',
    margin: '-.125rem 0 0 .5rem',
    verticalAlign: 'middle'
  }
});
