import React, { Component } from 'react';
import portal from 'react-portal-hoc';
import {getVisibleSelectionRect} from 'draft-js';
import draftjsPlugin from 'universal/utils/draftjsPlugin';

const LinkEditor = (props) => {
  const targetRect = getVisibleSelectionRect(window);
  const style = {
    position: 'absolute',
    top: targetRect ? targetRect.top + 32 : 0,
    left: targetRect ? targetRect.left : 0,
    border: '1px black solid'
  };
  console.log('LEE')
  return (
    <div style={style}>
      URL Change Remove
    </div>
  );
};

export default draftjsPlugin(
  portal({escToClose: true})(
    LinkEditor
  )
);
