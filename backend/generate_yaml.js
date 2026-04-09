const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Read .env file
const envConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '.env')));

// Convert to YAML format
let yamlContent = '';
for (const key in envConfig) {
  // Cloud Run automatically sets the PORT environment variable.
  // We must NOT provide it in our deployment configuration.
  if (key === 'PORT') continue;

  let value = envConfig[key];
  // Escape quotes and handle newlines for YAML
  value = value.replace(/"/g, '\\"').replace(/\n/g, '\\n');
  yamlContent += `${key}: "${value}"\n`;
}

// Write to .env.yaml
fs.writeFileSync(path.join(__dirname, '.env.yaml'), yamlContent);
console.log('Successfully generated .env.yaml for Cloud Run deployment (excluding PORT).');
