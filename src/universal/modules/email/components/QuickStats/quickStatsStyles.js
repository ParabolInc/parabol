import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'

const fontStyles = {
  color: appTheme.palette.dark,
  fontFamily: ui.emailFontFamily
}

const quickStatsStyles = {
  cellStyles: {
    padding: 0,
    textAlign: 'center',
    verticalAlign: 'top',
    width: '25%'
  },

  statStyles: {
    backgroundColor: appTheme.palette.light,
    padding: '8px 0 12px',
    textAlign: 'center'
  },

  statValue: {
    ...fontStyles,
    fontSize: '36px',
    lineHeight: '44px'
  },

  statLabel: {
    color: ui.palette.midGray,
    fontFamily: ui.emailFontFamily,
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase'
  },

  containerStyle: {
    margin: '0 auto',
    maxWidth: '440px',
    width: '100%'
  }
}

export default quickStatsStyles
