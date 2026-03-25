// generateAppleSecret.js
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

// 1️⃣ Load environment variables from .env explicitly
dotenv.config({ path: path.resolve('./.env.local') });

// 2️⃣ Read env variables
const TEAM_ID = process.env.APPLE_TEAM_ID;
const CLIENT_ID = process.env.APPLE_ID;
const KEY_ID = process.env.APPLE_KEY_ID;
const PRIVATE_KEY_PATH = path.resolve('./AuthKey.p8'); // path to your .p8 file

// 3️⃣ Validate env variables
if (!TEAM_ID || !CLIENT_ID || !KEY_ID) {
	throw new Error(
		'APPLE_TEAM_ID, APPLE_ID, and APPLE_KEY_ID must be set in your .env',
	);
}

// 4️⃣ Load private key
if (!fs.existsSync(PRIVATE_KEY_PATH)) {
	throw new Error(`Private key file not found at ${PRIVATE_KEY_PATH}`);
}
const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

// 5️⃣ Generate JWT token
const token = jwt.sign({}, PRIVATE_KEY, {
	algorithm: 'ES256',
	expiresIn: '180d', // Apple recommends max 6 months
	audience: 'https://appleid.apple.com',
	issuer: TEAM_ID,
	subject: CLIENT_ID,
	keyid: KEY_ID,
});

// 6️⃣ Output
console.log('Apple client secret:\n', token);
