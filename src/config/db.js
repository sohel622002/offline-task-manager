const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { Client } = require("pg");
const { runCommand, getPlatformKey, copyDirectory, cleanupTempDirectory, downloadFile, extractArchive, findPostgresBinaries } = require("../utils/helpers");
const { POSTGRES_URLS, DATA_DIR, BIN_DIR, TEMP_DIR, SCHEMA_FILE, POSTGRES_PORT } = require("../constant");

let postgresProcess = null;
let dbClient = null;
let isInitialized = false;

const initializePostgres = async () => {
  try {
    if (isInitialized) {
      return { success: true, message: "Already initialized" };
    }

    console.log("Starting PostgreSQL initialization...");

    // Check if postgres-bin directory exists
    if (!fs.existsSync(BIN_DIR)) {
      throw new Error(
        "postgres-bin directory not found. Please follow setup instructions."
      );
    }

    // Initialize data directory if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
      console.log("Initializing PostgreSQL data directory...");
      fs.mkdirSync(DATA_DIR, { recursive: true });

      const initdbPath = path.join(BIN_DIR, "bin", "initdb.exe");
      await runCommand(initdbPath, [
        "-D",
        DATA_DIR,
        "-U",
        "postgres",
        "--auth-local=trust",
      ]);
    }

    // Start PostgreSQL server
    console.log("Starting PostgreSQL server...");
    const postgresPath = path.join(BIN_DIR, "bin", "postgres.exe");

    postgresProcess = spawn(
      postgresPath,
      ["-D", DATA_DIR, "-p", POSTGRES_PORT.toString()],
      {
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

    postgresProcess.stdout.on("data", (data) => {
      console.log(`PostgreSQL: ${data}`);
    });

    postgresProcess.stderr.on("data", (data) => {
      console.log(`PostgreSQL Error: ${data}`);
    });

    // Wait for PostgreSQL to be ready
    await new Promise((resolve, reject) => {
      const checkConnection = async () => {
        try {
          const testClient = new Client({
            host: "localhost",
            port: POSTGRES_PORT,
            user: "postgres",
            database: "postgres",
          });
          await testClient.connect();
          await testClient.end();
          resolve();
        } catch (error) {
          setTimeout(checkConnection, 1000);
        }
      };
      setTimeout(checkConnection, 2000);
    });

    // Create database and table
    console.log("Setting up database...");
    dbClient = new Client({
      host: "localhost",
      port: POSTGRES_PORT,
      user: "postgres",
      database: "postgres",
    });

    await dbClient.connect();

    // Create database
    try {
      await dbClient.query("CREATE DATABASE appdb");
      console.log("Database appdb created");
    } catch (error) {
      if (!error.message.includes("already exists")) {
        throw error;
      }
      console.log("Database appdb already exists");
    }

    await dbClient.end();

    // Connect to the new database
    dbClient = new Client({
      host: "localhost",
      port: POSTGRES_PORT,
      user: "postgres",
      database: "appdb",
    });

    await dbClient.connect();

    // Run schema.sql
    console.log("Running schema.sql...");
    const schemaSQL = fs.readFileSync(SCHEMA_FILE, "utf8");
    await dbClient.query(schemaSQL);

    console.log("✅ All tables created (if not already)");
    isInitialized = true;

    return { success: true, message: "PostgreSQL initialized successfully" };
  } catch (error) {
    console.error("Initialization error:", error);
    throw Error(error.message);
  }
};

const downloadAndSetupPostgreSQL = async () => {
  try {
    console.log('🐘 PostgreSQL Auto-Downloader');
    console.log('==============================');
    
    // Check if postgres-bin already exists
    if (fs.existsSync(BIN_DIR)) {
      console.log('✅ postgres-bin directory already exists');
      
      // Check if it has the required binaries
      const binPath = path.join(BIN_DIR, 'bin');
      if (fs.existsSync(binPath)) {
        const files = fs.readdirSync(binPath);
        const hasPostgres = files.some(file => file.startsWith('postgres'));
        const hasInitdb = files.some(file => file.startsWith('initdb'));
        
        if (hasPostgres && hasInitdb) {
          console.log('✅ PostgreSQL binaries already present');
          return;
        }
      }
    }
    
    const platformKey = getPlatformKey();
    const downloadInfo = POSTGRES_URLS[platformKey];
    
    if (!downloadInfo) {
      throw new Error(`No download URL available for platform: ${platformKey}`);
    }
    
    console.log(`📥 Downloading PostgreSQL for ${platformKey}...`);
    
    // Create temp directory
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
    
    const archivePath = path.join(TEMP_DIR, downloadInfo.filename);
    
    // Download PostgreSQL
    await downloadFile(downloadInfo.url, archivePath);
    
    // Extract archive
    console.log('📦 Extracting PostgreSQL...');
    const extractPath = path.join(TEMP_DIR, 'extracted');
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }
    
    await extractArchive(archivePath, extractPath);
    
    // Find PostgreSQL binaries
    console.log('🔍 Locating PostgreSQL binaries...');
    const binariesPath = findPostgresBinaries(extractPath);
    
    if (!binariesPath) {
      throw new Error('Could not locate PostgreSQL binaries in extracted files');
    }
    
    // Copy binaries to postgres-bin
    console.log('📁 Setting up postgres-bin directory...');
    
    // Determine the structure to copy
    const parentDir = path.dirname(binariesPath);
    const isInBinSubdir = path.basename(binariesPath) === 'bin';
    
    if (isInBinSubdir) {
      // Copy the entire parent directory structure
      copyDirectory(parentDir, BIN_DIR);
    } else {
      // Create bin subdirectory and copy binaries there
      const targetBinDir = path.join(BIN_DIR, 'bin');
      if (!fs.existsSync(targetBinDir)) {
        fs.mkdirSync(targetBinDir, { recursive: true });
      }
      copyDirectory(binariesPath, targetBinDir);
      
      // Also copy lib and share directories if they exist
      const libDir = path.join(parentDir, 'lib');
      const shareDir = path.join(parentDir, 'share');
      
      if (fs.existsSync(libDir)) {
        copyDirectory(libDir, path.join(BIN_DIR, 'lib'));
      }
      
      if (fs.existsSync(shareDir)) {
        copyDirectory(shareDir, path.join(BIN_DIR, 'share'));
      }
    }
    
    // Clean up temp directory
    console.log('🧹 Cleaning up temporary files...');
    await cleanupTempDirectory();
    
    console.log('✅ PostgreSQL setup completed successfully!');
    console.log(`📂 Binaries installed in: ${BIN_DIR}`);
    console.log('🚀 You can now run "npm start" to start the application');
    
  } catch (error) {
    console.error('❌ Error setting up PostgreSQL:', error.message);
    
    // Clean up on error
    await cleanupTempDirectory();
    
    process.exit(1);
  }
}

const getDbClient = () => {
  if (!dbClient) throw new Error("Database not initialized yet.");
  return dbClient;
};

module.exports = { initializePostgres, downloadAndSetupPostgreSQL, getDbClient };
