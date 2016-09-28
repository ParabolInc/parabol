import React from 'react';
import Helmet from 'react-helmet';
import {head} from 'universal/utils/clientOptions';
import {Menu, MenuToggle, Type} from 'universal/components';
import FontAwesome from 'react-fontawesome';

const makeLabel = (string) =>
  <Type bold family="monospace" marginBottom="1rem" scale="s2">{'<'}{string}{' />'}</Type>;

const style = {
  margin: '0 auto',
  maxWidth: '80rem',
  padding: '2rem'
};

const demoIconSize = '28px';

const demoToggleStyle = {
  display: 'block',
  fontSize: demoIconSize,
  height: demoIconSize,
  lineHeight: demoIconSize
};

const demoToggle = (<FontAwesome name="plus-square-o" style={demoToggleStyle} />);

const demoMenuItems = [
  {
    label: 'Core',
    isActive: false,
    onClick: () => console.log('You selected Core')
  },
  {
    label: 'Design',
    isActive: false,
    onClick: () => console.log('You selected Design')
  },
  {
    label: 'Engineering',
    isActive: true,
    onClick: () => console.log('You selected Engineering')
  },
  {
    label: 'Product',
    isActive: false,
    onClick: () => console.log('You selected Product')
  },
  {
    label: 'Talent',
    isActive: false,
    onClick: () => console.log('You selected Talent')
  }
];

const PatternsContainer = () =>
  <div style={style}>
    <Helmet title="Welcome to the Action Pattern Library" {...head} />

    <h1>Pattern Library</h1>

    {makeLabel('MenuToggle')}
    {makeLabel('Menu')}
    <MenuToggle menuPosition="right" toggle={demoToggle}>
      <Menu items={demoMenuItems} label="Select Team:" />
    </MenuToggle>

  </div>;

export default PatternsContainer;
