#!/usr/bin/env node

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const bucketName = 'registro-participantes-dev-frontend-380012739300';
const distPath = path.join(__dirname, '../frontend/dist');

const s3 = new AWS.S3({
  region: 'us-east-1'
});

async function uploadDir(dirPath, s3Path = '') {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const s3Key = s3Path ? `${s3Path}/${file}` : file;

    if (fs.statSync(filePath).isDirectory()) {
      await uploadDir(filePath, s3Key);
    } else {
      const fileContent = fs.readFileSync(filePath);
      const params = {
        Bucket: bucketName,
        Key: s3Key,
        Body: fileContent,
        ContentType: getContentType(filePath)
      };

      try {
        await s3.upload(params).promise();
        console.log(`Uploaded: ${s3Key}`);
      } catch (err) {
        console.error(`Error uploading ${s3Key}:`, err);
      }
    }
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.map': 'application/json'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

async function main() {
  console.log(`Uploading ${distPath} to s3://${bucketName}/...`);
  await uploadDir(distPath);
  console.log('Upload complete!');
}

main().catch(console.error);
