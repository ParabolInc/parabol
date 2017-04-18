import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
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
    openOauth,
    options,
    removeOauth,
    styles
  } = props;
  return (
    <Row>
      <div className={css(styles.logo)}>
        <img height={50} width={50} src={logo} />
      </div>
      {/* <div className={css(styles.name)}>*/}
      {/* {name}*/}
      {/* </div>*/}
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
                size="smallest"
                buttonStyle="flat"
                onClick={openOauth}
              />
              <Button
                colorPalette="warm"
                label="Remove Token"
                size="smallest"
                buttonStyle="flat"
                onClick={removeOauth}
              />
            </div>
          </div> :
          <Button colorPalette="cool" label="Add integration" size="smallest" buttonStyle="solid" onClick={openOauth} />
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
    flexShrink: 0
  },

  manageService: {
    display: 'flex'
  },

  name: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontSize: appTheme.typography.s4,
    lineHeight: '1.625rem',
    verticalAlign: 'middle'
  }
});

export default withStyles(styleThunk)(ServiceRow);
