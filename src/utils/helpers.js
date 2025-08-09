const fs = require('fs');
const path = require("path");
const { spawn } = require("child_process");
const https = require('https');
const { TEMP_DIR } = require("../constant");
const extract = require('extract-zip');

const runCommand = (command, args) => {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

const getPlatformKey = () => {
  const platform = process.platform;
  const arch = process.arch;
  
  console.log(`Detected platform: ${platform}, architecture: ${arch}`);
  
  if (platform === 'win32') {
    return arch === 'x64' ? 'win32-x64' : 'win32-ia32';
  } else if (platform === 'darwin') {
    return arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64';
  } else if (platform === 'linux') {
    return 'linux-x64';
  }
  
  throw new Error(`Unsupported platform: ${platform}-${arch}`);
}

const copyDirectory = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      
      // Make executable on Unix-like systems
      if (process.platform !== 'win32') {
        try {
          fs.chmodSync(destPath, 0o755);
        } catch (err) {
          console.warn(`Could not make ${destPath} executable:`, err.message);
        }
      }
    }
  }
}

const cleanupTempDirectory = async () => {
  if (!fs.existsSync(TEMP_DIR)) {
    return;
  }
  
  try {
    // On Windows, some files might be locked, so we'll try multiple approaches
    if (process.platform === 'win32') {
      // First, try to remove read-only attributes recursively
      try {
        const { spawn } = require('child_process');
        await new Promise((resolve) => {
          const attrib = spawn('attrib', ['-R', path.join(TEMP_DIR, '*'), '/S'], { stdio: 'ignore' });
          attrib.on('close', () => resolve());
          attrib.on('error', () => resolve()); // Ignore errors, continue cleanup
        });
      } catch (err) {
        // Ignore attrib errors
      }
      
      // Try to remove with timeout
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && fs.existsSync(TEMP_DIR)) {
        try {
          fs.rmSync(TEMP_DIR, { recursive: true, force: true });
          break;
        } catch (error) {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`Cleanup attempt ${attempts} failed, retrying in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.warn('⚠️ Could not fully clean up temporary directory. You may need to manually delete:', TEMP_DIR);
            console.warn('This is usually due to file locks and is safe to ignore.');
          }
        }
      }
    } else {
      // On Unix-like systems, standard cleanup should work
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  } catch (error) {
    console.warn('⚠️ Could not fully clean up temporary directory:', error.message);
    console.warn('You may need to manually delete:', TEMP_DIR);
  }
}

const downloadFile = (url, destination) => {
  return new Promise((resolve, reject) => {
    console.log(`Downloading from: ${url}`);
    console.log(`Saving to: ${destination}`);
    
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        return downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize) {
          const percent = ((downloadedSize / totalSize) * 100).toFixed(1);
          process.stdout.write(`\rDownloading... ${percent}%`);
        }
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('\nDownload completed!');
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(destination, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', reject);
  });
}

const extractArchive = async (archivePath, extractPath) => {
  console.log(`Extracting ${archivePath} to ${extractPath}`);
  
  if (archivePath.endsWith('.zip')) {
    await extract(archivePath, { dir: extractPath });
  } else if (archivePath.endsWith('.tar.gz')) {
    // For tar.gz files, use tar command
    return new Promise((resolve, reject) => {
      const tar = spawn('tar', ['-xzf', archivePath, '-C', extractPath]);
      
      tar.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`tar extraction failed with code ${code}`));
        }
      });
      
      tar.on('error', reject);
    });
  }
}

const findPostgresBinaries = (extractPath) => {
  // Common paths where PostgreSQL binaries might be located
  const possiblePaths = [
    path.join(extractPath, 'pgsql', 'bin'),
    path.join(extractPath, 'postgresql', 'bin'),
    path.join(extractPath, 'bin'),
    path.join(extractPath, 'pgsql'),
    path.join(extractPath, 'postgresql')
  ];
  
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      const files = fs.readdirSync(possiblePath);
      const hasPostgres = files.some(file => 
        file.startsWith('postgres') && (file.endsWith('.exe') || !file.includes('.'))
      );
      const hasInitdb = files.some(file => 
        file.startsWith('initdb') && (file.endsWith('.exe') || !file.includes('.'))
      );
      
      if (hasPostgres && hasInitdb) {
        console.log(`Found PostgreSQL binaries in: ${possiblePath}`);
        return possiblePath;
      }
    }
  }
  
  // If not found in bin directories, look for the parent directory
  const walkDir = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        const result = findPostgresBinaries(fullPath);
        if (result) return result;
      }
    }
    return null;
  };
  
  return walkDir(extractPath);
}

module.exports = { runCommand, getPlatformKey, copyDirectory, cleanupTempDirectory, downloadFile, extractArchive, findPostgresBinaries }