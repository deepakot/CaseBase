require('dotenv').config();
const { performSearch } = require('./src/services/retrieval');

async function test() {
  try {
    const results = await performSearch('breach of contract in retail');
    console.log(results);
  } catch (e) {
    console.error(e);
  }
}

test();
