const { exec } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const backupDir = path.join(__dirname, '../backups');

if (!fs.existsSync(backupDir)){
    fs.mkdirSync(backupDir);
}

const date = new Date().toISOString().replace(/:/g, '-');
const backupPath = path.join(backupDir, `backup-${date}`);

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error('MONGO_URI is not defined in .env');
    process.exit(1);
}

console.log(`Starting backup to ${backupPath}...`);

// specific command might vary based on connection string type (srv vs standard)
// For SRV, mongodump --uri="mongodb+srv://..." 
const cmd = `mongodump --uri="${mongoUri}" --out="${backupPath}"`;

exec(cmd, (error, stdout, stderr) => {
    if (error) {
        console.error(`Backup failed: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
    }
    console.log(`Backup completed successfully at ${backupPath}`);
});
