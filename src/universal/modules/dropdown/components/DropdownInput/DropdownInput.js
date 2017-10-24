import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import FieldBlock from 'universal/components/FieldBlock/FieldBlock';
import FieldLabel from 'universal/components/FieldLabel/FieldLabel';
import ui from 'universal/styles/ui';
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette';
import {Menu, MenuItem} from 'universal/modules/menu';

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const DropdownInput = (props) => {
  const {
    disabled,
    fieldSize,
    input: {name, onChange, value},
    label,
    organizations = [],
    styles
  } = props;
  const org = organizations.find((anOrg) => anOrg.id === value);
  const orgName = org && org.name || 'Loading...';
  const size = fieldSize || ui.fieldSizeOptions[1];
  const toggleLineHeight = {
    small: '1.875rem',
    medium: '2.375rem',
    large: '3.125rem'
  };
  const toggleStyles = {
    fontSize: ui.iconSize,
    lineHeight: toggleLineHeight[size]
  };
  const toggle = <FontAwesome className={css(styles.downButton)} name="chevron-down" style={toggleStyles} />;
  const itemFactory = () => {
    return organizations.map((anOrg) => {
      return (
        <MenuItem
          isActive={value === anOrg.id}
          key={`orgDropdownMenuItem${anOrg.id}`}
          label={anOrg.name}
          onClick={() => {
            onChange(anOrg.id);
          }}
        />
      );
    });
  };
  const fieldInputStyles = css(
    styles.inputBlock,
    disabled ? styles.inputDisabled : styles.inputNotDisabled
  );
  return (
    <FieldBlock>
      {label && <FieldLabel fieldSize={fieldSize} label={label} htmlFor={name} indent />}
      <div className={fieldInputStyles} tabIndex="1">
        <span>{orgName}</span>
        {!disabled &&
          <Menu
            originAnchor={originAnchor}
            maxHeight="none"
            menuWidth="13rem"
            targetAnchor={targetAnchor}
            toggle={toggle}
            itemFactory={itemFactory}
            label="Select Organization:"
          />
        }
      </div>
    </FieldBlock>
  );
};

DropdownInput.propTypes = {
  disabled: PropTypes.bool,
  fieldSize: PropTypes.oneOf(ui.fieldSizeOptions),
  input: PropTypes.shape({
    name: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.string
  }),
  label: PropTypes.string,
  organizations: PropTypes.array,
  styles: PropTypes.object
};

const styleThunk = (theme, {fieldSize}) => {
  const size = fieldSize || ui.fieldSizeOptions[1];
  const paddingRight = ui.controlBlockPaddingHorizontal[size];
  return ({
    downButton: {
      cursor: 'pointer',
      height: '100%',
      padding: 0,
      paddingRight,
      position: 'absolute',
      right: 0,
      textAlign: 'right',
      top: 0,
      width: '100%'
    },

    inputBlock: {
      ...ui.fieldBaseStyles,
      ...ui.fieldSizeStyles[size],
      ...makeFieldColorPalette('white', false),
      position: 'relative'
    },

    inputNotDisabled: makeFieldColorPalette('white', true),

    inputDisabled: ui.fieldDisabled,

    menuButtonBlock: {
      backgroundColor: '#fff',
      borderTop: `.0625rem solid ${ui.menuBorderColor}`,
      padding: '.5rem .5rem 0',
      width: '100%'
    }
  });
};

export default withStyles(styleThunk)(DropdownInput);
