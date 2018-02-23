/**
 * Wraps content with the authentication page scaffolding (e.g. header).
 *
 * @flow
 */

import type {Node} from 'react';

import React from 'react';
import styled from 'react-emotion';

import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import appTheme from 'universal/styles/theme/appTheme';
import Header from './Header';

type Props = {
  children: Node,
  title: string
};

const PageContainer = styled('div')({
  color: appTheme.palette.dark,
  display: 'flex',
  flexDirection: 'column'
});

const CenteredBlock = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%'
});

export default ({children, title}: Props) => (
  <PageContainer>
    <Helmet title={title} />
    <Header />
    <CenteredBlock>
      {children}
    </CenteredBlock>
  </PageContainer>
);
