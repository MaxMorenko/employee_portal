const path = require('path');
const { runMigrations, DB_PATH } = require('./index');

runMigrations();
console.log(`Database ready at ${path.basename(DB_PATH)}`);
