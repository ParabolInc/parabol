import ui from 'universal/styles/ui'

const gutter = 16 // #gutter

export default {
  message: {
    color: ui.colorText,
    flex: 1,
    fontSize: 14,
    lineHeight: '20px',
    marginLeft: gutter
  },
  messageVar: {
    textDecoration: 'underline'
  },
  messageSub: {
    color: ui.colorText,
    fontSize: 13,
    marginTop: 4
  },
  notifLink: {
    cursor: 'pointer',
    ':hover': {
      color: ui.palette.warm
    }
  },
  button: {
    marginLeft: gutter,
    minWidth: 82
  },
  widerButton: {
    marginLeft: gutter,
    minWidth: 132
  },
  widestButton: {
    marginLeft: gutter,
    minWidth: 176
  },
  buttonGroup: {
    display: 'flex'
  },
  owner: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: 8
  },
  ownerAvatar: {
    borderRadius: '100%',
    display: 'block',
    height: 24,
    width: 24
  },
  ownerName: {
    fontWeight: 600,
    paddingLeft: 8
  }
}
