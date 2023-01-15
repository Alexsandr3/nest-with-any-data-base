export const writeSql = async (sql: string) => {
  // eslint-disable-next-line atupescript-eslint/no-var-requires
  const fs = require('fs/promises');
  try {
    await fs.writeFile('./src/helpers/sql.txt', sql);
  } catch (e) {
    console.log(e);
  }
};
