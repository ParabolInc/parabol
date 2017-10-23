import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';

class Radio extends Component {
  static propTypes = {
    customStyles: PropTypes.object,
    fieldSize: PropTypes.oneOf(ui.fieldSizeOptions),
    name: PropTypes.string,
    indent: PropTypes.bool,
    inline: PropTypes.bool,
    input: PropTypes.object.isRequired,
    label: PropTypes.any,
    labelPlacement: PropTypes.oneOf([
      'left',
      'right'
    ]),
    styles: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      selected: null
    };
  }

  render() {
    const {
      name,
      label,
      input,
      styles
    } = this.props;

    return (
      <label className={css(styles.radioBase)}>
        <input {...input} className={css(styles.radioInput)} name={name} type="radio" />
        {label &&
        <div className={css(styles.radioLabel)}>
          {label}
        </div>
        }
      </label>
    );
  }
}

const styleThunk = (theme, {customStyles, fieldSize, indent, inline, labelPlacement}) => {
  const placement = labelPlacement || 'right';
  const labelOrder = placement === 'left' ? 1 : 3;
  const size = fieldSize || 'medium';
  const fieldSizeStyles = ui.fieldSizeStyles[size];
  const inlineStyles = {
    lineHeight: fieldSizeStyles.lineHeight,
    paddingBottom: ui.controlBlockPaddingVertical[size],
    paddingTop: ui.controlBlockPaddingVertical[size]
  };
  const paddingLeft = (fieldSize && indent) ? ui.controlBlockPaddingHorizontal[size] : 0;
  const useInlineStyles = (fieldSize && inline) && inlineStyles;
  return ({
    radioBase: {
      alignItems: 'center',
      display: 'flex',
      fontSize: fieldSizeStyles.fontSize,
      lineHeight: fieldSizeStyles.lineHeight,
      // 1. Line up controls when inline
      ...useInlineStyles,
      // 2. Optionally line up left edge of text using indent bool
      paddingLeft,
      // 3. Do what ya want
      ...customStyles
    },

    radioInput: {
      order: 2
    },

    radioLabel: {
      order: labelOrder,
      paddingLeft: placement === 'right' && '.5rem',
      paddingRight: placement === 'left' && '.5rem'
    }
  });
};

export default withStyles(styleThunk)(Radio);
