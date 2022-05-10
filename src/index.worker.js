import initSqlJs from '@jlongster/sql.js';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';

let SQL = null;

async function init() {
  SQL = await initSqlJs({
    locateFile: (file) => `../${file}`,
  });

  let sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend());

  SQL.register_for_idb(sqlFS);

  SQL.FS.mkdir('/sql');
  SQL.FS.mount(sqlFS, {}, '/sql');
}

async function getDatabase() {
  const path = '/sql/db.sqlite';
  if (typeof SharedArrayBuffer === 'undefined') {
    let stream = SQL.FS.open(path, 'a+');
    await stream.node.contents.readIfFallback();
    SQL.FS.close(stream);
  }

  let db = new SQL.Database(path, { filename: true });
  // You might want to try `PRAGMA page_size=8192;` too!
  db.exec(`
      PRAGMA journal_mode=MEMORY;
    `);

  return db;
}

async function populateAction(count, { timings = true } = {}) {
  let db = await getDatabase();
  clear(db);
  populate(db, count);
}

async function clear(db, output = console.log) {
  output('Clearing existing data');
  db.exec(`
      BEGIN TRANSACTION;
      DROP TABLE IF EXISTS kv;
      CREATE TABLE kv (key TEXT, value TEXT);
      COMMIT;
    `);
  output('Done');
}

function populate(db, count, output = console.log, outputTiming = console.log) {
  let start = Date.now();
  db.exec('BEGIN TRANSACTION');
  let stmt = db.prepare('INSERT INTO kv (key, value) VALUES (?, ?)');

  output(`Inserting ${count} items`);

  for (let i = 0; i < count; i++) {
    stmt.run([uid(i), ((Math.random() * 100) | 0).toString()]);
  }
  db.exec('COMMIT');
  let took = Date.now() - start;
  output('Done! Took: ' + took);
  outputTiming(took);
}

function uid(i) {
  return '0000000000000000000000000' + i;
}

/* eslint-disable-next-line no-restricted-globals */
// eslint-disable-next-line no-undef
self.onmessage = async (message) => {
  if (message) {
    switch (message.data.type) {
      case 'search':
        await init();
        await populateAction(message.data);
        break;
    }
  }
};
