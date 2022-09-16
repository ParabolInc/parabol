import styled from '@emotion/styled'
import {CreditCard, Extension, Group} from '@mui/icons-material'
import React from 'react'
import {PALETTE} from '../../styles/paletteV3'

//    TODO:
//  • Add themes, not just mid/purple (TA)
//  • Make icons optional (TA)
//  • Add disabled styles (TA)

const StyledIcon = styled('div')({
  height: 18,
  width: 18,
  '& svg': {
    fontSize: 18
  },
  marginRight: '.25rem',
  verticalAlign: 'middle'
})

const Nav = styled('div')({
  display: 'flex',
  width: '100%'
})

const Item = styled('div')<{isActive: boolean; isFirst: boolean; isLast: boolean}>(
  ({isActive, isFirst, isLast}) => ({
    alignItems: 'center',
    backgroundColor: isActive ? PALETTE.GRAPE_700 : 'transparent',
    border: `1px solid ${PALETTE.GRAPE_700}`,
    borderBottomLeftRadius: isFirst ? 2 : undefined,
    borderTopLeftRadius: isFirst ? 2 : undefined,
    borderBottomRightRadius: isLast ? 2 : undefined,
    borderTopRightRadius: isLast ? 2 : undefined,
    borderLeftWidth: isFirst ? 1 : 0,
    color: isActive ? '#FFFFFF' : PALETTE.GRAPE_700,
    cursor: isActive ? 'default' : 'pointer',
    display: 'flex',
    flex: 1,
    fontSize: 14,
    fontWeight: 600,
    justifyContent: 'center',
    lineHeight: '26px',
    textAlign: 'center',
    textDecoration: 'none',
    ':hover,:focus': {
      backgroundColor: isActive ? PALETTE.GRAPE_700 : PALETTE.SLATE_300,
      color: isActive ? '#FFFFFF' : PALETTE.GRAPE_800,
      textDecoration: 'none'
    }
  })
)

interface Props {
  //FIXME 6062: change item.icon to React.ComponentType
  items: any[]
}

const ToggleNav = (props: Props) => {
  const {items} = props

  return (
    <Nav>
      {items.map((item, index) => {
        return (
          <Item
            key={item.label}
            onClick={item.onClick}
            title={item.label}
            isActive={item.isActive}
            isFirst={index === 0}
            isLast={index === items.length - 1}
          >
            <StyledIcon>
              {
                {
                  group: <Group />,
                  extension: <Extension />,
                  credit_card: <CreditCard />
                }[item.icon]
              }
            </StyledIcon>
            {item.label}
          </Item>
        )
      })}
    </Nav>
  )
}

export default ToggleNav
