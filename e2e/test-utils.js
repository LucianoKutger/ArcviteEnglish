export const gotoApp = async (page, path = '/') => {
  await page.goto(path, {
    waitUntil: 'domcontentloaded',
  });
};
