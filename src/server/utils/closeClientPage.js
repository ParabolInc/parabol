const closeClientPage = (res) => {
  res.send('<!DOCTYPE html><html><head><script>(window.close())()</script></head></html>');
};

export default closeClientPage;
