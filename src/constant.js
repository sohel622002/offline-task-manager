const path = require("path");

const POSTGRES_URLS = {
  'win32-x64': {
    url: 'https://get.enterprisedb.com/postgresql/postgresql-15.4-1-windows-x64-binaries.zip',
    filename: 'postgresql-windows-x64.zip'
  },
  'win32-ia32': {
    url: 'https://get.enterprisedb.com/postgresql/postgresql-15.4-1-windows-binaries.zip',
    filename: 'postgresql-windows-x32.zip'
  },
  'darwin-x64': {
    url: 'https://get.enterprisedb.com/postgresql/postgresql-15.4-1-osx-binaries.zip',
    filename: 'postgresql-macos.zip'
  },
  'darwin-arm64': {
    url: 'https://get.enterprisedb.com/postgresql/postgresql-15.4-1-osx-binaries.zip',
    filename: 'postgresql-macos-arm.zip'
  },
  'linux-x64': {
    url: 'https://get.enterprisedb.com/postgresql/postgresql-15.4-1-linux-x64-binaries.tar.gz',
    filename: 'postgresql-linux-x64.tar.gz'
  }
};

const DATA_DIR = path.join(__dirname, "../postgres_data");
const BIN_DIR = path.join(__dirname, "../postgres-bin");
const TEMP_DIR = path.join(__dirname, '../temp-postgres');
const SCHEMA_FILE = path.join(__dirname, "./db/schema.sql");

const POSTGRES_PORT = 55432;

module.exports = { POSTGRES_URLS, DATA_DIR, BIN_DIR, TEMP_DIR, SCHEMA_FILE, POSTGRES_PORT };