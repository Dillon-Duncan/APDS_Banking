const crypto = require('crypto');
const { writeFileSync } = require('fs');
const keytar = require('keytar');

const rotateSecrets = () => {
  const newSecrets = {
    JWT_SECRET: crypto.randomBytes(64).toString('base64'),
    CSRF_SECRET: crypto.randomBytes(64).toString('base64')
  };
  
  writeFileSync('.env', 
    Object.entries(newSecrets)
      .map(([k,v]) => `${k}=${v}`)
      .join('\n')
  );
  
  console.log('Secrets rotated. Restart services!');
};

const setSecret = async (key, value) => {
  await keytar.setPassword('apds_banking', key, value);
  process.env[key] = value;
};