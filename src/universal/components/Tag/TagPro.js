import PropTypes from 'prop-types';
import React from 'react';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import {tagBase} from './tagBase';
import styled from 'react-emotion';

const TagProRoot = styled('div')({
  ...tagBase,
  backgroundColor: appTheme.palette.yellow70d,
  minWidth: '3.25rem',
  padding: '.0625rem'
});

const TagProInner = styled('div')({
  backgroundColor: appTheme.palette.yellow80d,
  borderRadius: '4em',
  border: '.0625rem solid rgba(255, 255, 255, .5)',
  color: appTheme.palette.yellow40d,
  height: '.875rem',
  lineHeight: '.75rem',
  padding: ui.tagPadding,
  textShadow: '0 .0625rem 0 rgba(255, 255, 255, .5)'
});

const TagPro = (props) => {
  const {label} = props;
  return (
    <TagProRoot>
      <TagProInner>
        {label || 'Pro'}
      </TagProInner>
    </TagProRoot>
  );
};

TagPro.propTypes = {
  label: PropTypes.string
};

export default TagPro;
