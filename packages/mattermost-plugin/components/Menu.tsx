import {MoreVert} from '@mui/icons-material'
import {IconButton, Menu, MenuItem} from '@mui/material'
import React from 'react'

type MenuOption = {
  label: string
  onClick: () => void
}

type Props = {
  options: MenuOption[]
}

const MoreMenu = ({options}: Props) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  return (
    <div>
      <IconButton
        aria-label='more'
        id='long-button'
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup='true'
        onClick={handleOpen}
      >
        <MoreVert />
      </IconButton>
      <Menu
        id='long-menu'
        MenuListProps={{
          'aria-labelledby': 'long-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {options.map(({label, onClick}) => (
          <MenuItem
            style={{fontSize: '1.5rem'}}
            key={label}
            onClick={() => {
              onClick()
              handleClose()
            }}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}

export default MoreMenu
