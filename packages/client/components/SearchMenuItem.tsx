import styled from '@emotion/styled'
import React from 'react'

import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'

import Icon from './Icon'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import MenuSearch from './MenuSearch'

const SearchItem = styled(MenuItemLabel)({
  margin: '0 8px 8px',
  overflow: 'visible',
  padding: 0,
  position: 'relative'
});

const StyledMenuItemIcon = styled(MenuItemComponentAvatar)({
  position: 'absolute',
  left: 8,
  margin: 0,
  pointerEvents: 'none',
  top: 4
});

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD18
});

interface Props {
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}

export const SearchMenuItem: React.FC<Props> = ({placeholder, onChange, value}) => {
  return (
    <SearchItem>
      <StyledMenuItemIcon>
        <SearchIcon>search</SearchIcon>
      </StyledMenuItemIcon>
      <MenuSearch placeholder={placeholder} onChange={onChange} value={value} />
    </SearchItem>
  );
}
