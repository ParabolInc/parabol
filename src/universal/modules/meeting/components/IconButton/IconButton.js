import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';

const { cool } = theme.palette;

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class IconButton extends Component {
  static propTypes = {
    iconName: PropTypes.string,
    iconSize: PropTypes.string,
    onClick: PropTypes.func
  }

  renderIcon(name, size) {
    let icon;

    // Size options: "lg","2x","3x","4x","5x"
    if (size) {
      icon = <FontAwesome name={name} size={size} />;
    } else {
      icon = <FontAwesome name={name} />;
    }

    return icon;
  }

  render() {
    const { iconName, iconSize, onClick } = this.props;

    return (
      <button className={styles.iconButton} onClick={onClick}>
        {
          this.renderIcon(iconName, iconSize)
        }
      </button>
    );
  }
}

styles = StyleSheet.create({
  iconButton: {
    background: 'none',
    border: 0,
    borderRadius: 0,
    color: theme.palette.tuColorA40o.color,
    cursor: 'pointer',
    fontSize: theme.typography.fs3,
    padding: 0,

    // NOTE: :hover, :focus, :active have the same styling
    ':hover': {
      color: cool,
      outline: 'none'
    },
    ':focus': {
      color: cool,
      outline: 'none'
    },
    ':active': {
      color: cool,
      outline: 'none'
    }
  }
});
