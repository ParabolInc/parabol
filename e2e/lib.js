import { Builder } from 'selenium-webdriver';

export function all(...promises) {
  return Promise.all(promises);
}

function mapObj(fn, obj) {
  return Object.keys(obj).reduce(
    (newObj, curKey) => ({
      ...newObj,
      ...{ [curKey]: fn(curKey, obj[curKey]) }
    }),
    {}
  );
}

function bindUserBehaviors(driver, behaviors) {
  return mapObj((behaviorName, curriedBehavior) => {
    return typeof curriedBehavior === 'function'
      ? curriedBehavior(driver)
      : bindUserBehaviors(driver, curriedBehavior);
  }, behaviors);
}

export async function newUserSession({ browser, behaviors }) {
  const driver = await new Builder().forBrowser(browser).build();
  return {
    ...bindUserBehaviors(driver, behaviors),
    quit: driver.quit.bind(driver)
  };
}
