// src/config/r2.config.ts

import { S3Client } from '@aws-sdk/client-s3';
import { envVars } from './env';

const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${envVars.R2.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: envVars.R2.R2_ACCESS_KEY_ID,
        secretAccessKey: envVars.R2.R2_SECRET_ACCESS_KEY,
    },
});

export default r2Client;