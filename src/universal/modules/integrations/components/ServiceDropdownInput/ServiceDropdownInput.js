import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import FieldBlock from 'universal/components/FieldBlock/FieldBlock';
import {Menu, MenuItem} from 'universal/modules/menu';
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'left'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'left'
};

const ServiceDropdownInput = (props) => {
  const {isLoaded, fetchOptions, dropdownText, handleItemClick, options, styles} = props;
  const toggle = <FontAwesome className={css(styles.downButton)} name="chevron-down" onClick={fetchOptions} />;
  return (
    <div className={css(styles.dropdownBlock)}>
      <FieldBlock>
        <div className={css(styles.inputBlock)} tabIndex="1">
          <span>{dropdownText}</span>
          <Menu
            isLoaded={isLoaded}
            menuWidth="28.875rem"
            originAnchor={originAnchor}
            targetAnchor={targetAnchor}
            toggle={toggle}
          >
            {options.map((option) => {
              return (
                <MenuItem
                  isActive={false}
                  key={`serviceDropdownMenuItem${option.id}`}
                  label={option.label}
                  onClick={handleItemClick(option)}
                />
              );
            })}
          </Menu>
        </div>
      </FieldBlock>
    </div>
  );
};

ServiceDropdownInput.propTypes = {
  isLoaded: PropTypes.bool,
  fetchOptions: PropTypes.func.isRequired,
  dropdownText: PropTypes.string.isRequired,
  handleItemClick: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  styles: PropTypes.object
};

const styleThunk = () => ({
  dropdownBlock: {
    width: '100%'
  },

  downButton: {
    cursor: 'pointer',
    fontSize: `${ui.iconSize} !important`,
    height: '100% !important',
    lineHeight: '2.375rem !important',
    padding: '0 1rem 0 0',
    position: 'absolute',
    left: '-1px',
    right: '-1px',
    textAlign: 'right',
    top: 0
  },

  inputBlock: {
    ...ui.fieldBaseStyles,
    ...ui.fieldSizeStyles.medium,
    ...makeFieldColorPalette('white'),
    position: 'relative',
    userSelect: 'none'
  },

  menuButtonBlock: {
    backgroundColor: '#fff',
    borderTop: `1px solid ${ui.menuBorderColor}`,
    padding: '.5rem .5rem 0',
    width: '100%'
  }
});

export default withStyles(styleThunk)(ServiceDropdownInput);
