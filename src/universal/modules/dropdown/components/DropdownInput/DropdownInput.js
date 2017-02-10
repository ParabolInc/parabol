import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import FieldBlock from 'universal/components/FieldBlock/FieldBlock';
import FieldLabel from 'universal/components/FieldLabel/FieldLabel';
import ui from 'universal/styles/ui';
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette';
import makeHoverFocus from 'universal/styles/helpers/makeHoverFocus';
import {Menu, MenuItem} from 'universal/modules/menu';
import Button from 'universal/components/Button/Button';

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const DropdownInput = (props) => {
  const {handleCreateNew, input: {name, onChange, value}, label, organizations = [], styles} = props;
  const org = organizations.find((org) => org.id === value);
  const orgName = org && org.name || 'Loading...';
  const toggle = <FontAwesome className={css(styles.downButton)} name="chevron-down"/>;
  const itemFactory = () => {
    return organizations.map((org, idx) => {
      return (
        <MenuItem
          isActive={value === org.id}
          key={`orgDropdownMenuItem${idx}`}
          label={org.name}
          onClick={() => {
            onChange(org.id)
          }}
        />
      )
    })
      .concat(<MenuItem
        key={'newOrg'}
        label={
          <div className={css(styles.menuButtonBlock)}>
            <Button colorPalette="mid" isBlock label="Create New Organization" size="smallest" onClick={handleCreateNew}/>
          </div>
        }
      />);
  };
  return (
    <FieldBlock>
      {label && <FieldLabel label={label} htmlFor={name}/>}
      <div className={css(styles.inputBlock)}>
        <span>{orgName}</span>
        <Menu
          originAnchor={originAnchor}
          menuWidth="12rem"
          targetAnchor={targetAnchor}
          toggle={toggle}
          itemFactory={itemFactory}
          label="Select Organization:"
        />
      </div>
    </FieldBlock>
  );
};

const styleThunk = () => ({
  downButton: {
    cursor: 'pointer',
    fontSize: `${ui.iconSize} !important`,
    height: '100% !important',
    lineHeight: '2.25rem !important',
    padding: '0 1rem 0 0',
    position: 'absolute',
    right: 0,
    textAlign: 'right',
    top: 0,
    width: '100%'
  },

  inputBlock: {
    ...ui.fieldBaseStyles,
    ...makeFieldColorPalette('gray'),
    ...makeHoverFocus({
      borderColor: ui.fieldColorPalettes.gray.focusBorderColor
    }),
    position: 'relative'
  },

  menuButtonBlock: {
    backgroundColor: '#fff',
    borderTop: `1px solid ${ui.menuBorderColor}`,
    padding: '.5rem .5rem 0',
    width: '100%'
  }
});

export default withStyles(styleThunk)(DropdownInput);
