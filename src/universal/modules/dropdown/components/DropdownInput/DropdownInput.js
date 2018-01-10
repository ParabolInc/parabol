import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import FieldBlock from 'universal/components/FieldBlock/FieldBlock';
import FieldLabel from 'universal/components/FieldLabel/FieldLabel';
import TagPro from 'universal/components/Tag/TagPro';
import {Menu, MenuItem} from 'universal/modules/menu';
import {textOverflow} from 'universal/styles/helpers';
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {PRO} from 'universal/utils/constants';

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
          label={
            <span className={css(styles.orgNameMenuItem)}>
              <span>{anOrg.name}</span>
              {anOrg.tier === PRO && <TagPro />}
            </span>
          }
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
        {org.tier === PRO && <TagPro />}
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
    },

    orgNameMenuItem: {
      ...textOverflow,
      fontSize: ui.menuItemFontSize,
      lineHeight: ui.menuItemHeight,
      padding: `0 ${ui.menuGutterHorizontal}`
    }
  });
};

export default withStyles(styleThunk)(DropdownInput);
