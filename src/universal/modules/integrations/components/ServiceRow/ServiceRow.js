import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import Row from 'universal/components/Row/Row';
import Button from '../../../../components/Button/Button';
import ServiceDropdownInput from 'universal/modules/integrations/components/ServiceDropdownInput/ServiceDropdownInput';

const ServiceRow = (props) => {
  const {
    accessToken,
    dropdownMapper,
    dropdownText,
    handleItemClick,
    logo,
    name,
    openOauth,
    options,
    removeOauth,
    styles
  } = props;
  return (
    <Row>
      <img className={css(styles.logo)} height={44} width={44} src={logo} />
      <div className={css(styles.name)}>
        {name}
      </div>
      <div />
      {
        accessToken ?
          <div className={css(styles.hasToken)}>
            <ServiceDropdownInput
              dropdownMapper={dropdownMapper}
              dropdownText={dropdownText}
              handleItemClick={handleItemClick}
              options={options}
            />
            <div className={css(styles.manageService)}>
              <Button
                colorPalette="cool"
                label="Refresh Token"
                buttonSize="small"
                buttonStyle="flat"
                onClick={openOauth}
              />
              <Button
                colorPalette="warm"
                label="Remove Token"
                buttonSize="small"
                buttonStyle="flat"
                onClick={removeOauth}
              />
            </div>
          </div> :
          <Button colorPalette="cool" label="Add Integration" buttonSize="small" buttonStyle="solid" onClick={openOauth} />
      }
    </Row>
  );
};

ServiceRow.propTypes = {
  accessToken: PropTypes.string,
  dropdownMapper: PropTypes.func,
  dropdownText: PropTypes.string,
  handleItemClick: PropTypes.func,
  logo: PropTypes.string,
  name: PropTypes.string,
  openOauth: PropTypes.func,
  options: PropTypes.array,
  removeOauth: PropTypes.func,
  styles: PropTypes.object
};

const styleThunk = () => ({
  hasToken: {
    display: 'flex'
  },

  logo: {
    border: `.0625rem solid ${appTheme.palette.mid30l}`,
    borderRadius: ui.borderRadiusSmall,
    display: 'block',
    flexShrink: 0,
    marginRight: ui.rowGutter
  },

  manageService: {
    display: 'flex'
  },

  name: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontSize: appTheme.typography.s4,
    fontWeight: 700,
    flex: 1,
    lineHeight: '1.625rem',
    verticalAlign: 'middle'
  }
});

export default withStyles(styleThunk)(ServiceRow);
