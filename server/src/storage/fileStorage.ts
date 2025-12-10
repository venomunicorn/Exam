import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
export function initStorage() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Initialize empty files if not exist
    const files = ['users.json', 'attempts.json'];
    for (const file of files) {
        const filePath = path.join(DATA_DIR, file);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '[]');
        }
    }

    console.log('📁 File storage initialized at', DATA_DIR);
}

// Generic read/write functions
function readFile<T>(filename: string): T[] {
    const filePath = path.join(DATA_DIR, filename);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

function writeFile<T>(filename: string, data: T[]): void {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// User types and functions
export interface StoredUser {
    id: number;
    email: string;
    passwordHash: string;
    createdAt: string;
}

export function getUsers(): StoredUser[] {
    return readFile<StoredUser>('users.json');
}

export function getUserByEmail(email: string): StoredUser | undefined {
    return getUsers().find(u => u.email === email);
}

export function getUserById(id: number): StoredUser | undefined {
    return getUsers().find(u => u.id === id);
}

export function createUser(email: string, passwordHash: string): StoredUser {
    const users = getUsers();
    const newUser: StoredUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeFile('users.json', users);
    return newUser;
}

// Attempt types and functions
export interface StoredAttempt {
    id: number;
    odId: number;
    paperId: string;
    status: 'started' | 'completed' | 'abandoned';
    startedAt: string;
    endedAt?: string;
    expectedEnd: string;
    answersJson: Record<string, unknown>;
    timesJson: Record<string, number>;
    finalScore?: number;
    summaryJson?: Record<string, unknown>;
}

export function getAttempts(): StoredAttempt[] {
    return readFile<StoredAttempt>('attempts.json');
}

export function getAttemptsByUser(userId: number): StoredAttempt[] {
    return getAttempts().filter(a => a.odId === userId);
}

export function getAttemptById(id: number): StoredAttempt | undefined {
    return getAttempts().find(a => a.id === id);
}

export function createAttempt(
    userId: number,
    paperId: string,
    durationMinutes: number
): StoredAttempt {
    const attempts = getAttempts();
    const now = new Date();
    const expectedEnd = new Date(now.getTime() + durationMinutes * 60 * 1000);

    const newAttempt: StoredAttempt = {
        id: attempts.length > 0 ? Math.max(...attempts.map(a => a.id)) + 1 : 1,
        odId: userId,
        paperId,
        status: 'started',
        startedAt: now.toISOString(),
        expectedEnd: expectedEnd.toISOString(),
        answersJson: {},
        timesJson: {},
    };
    attempts.push(newAttempt);
    writeFile('attempts.json', attempts);
    return newAttempt;
}

export function updateAttempt(id: number, updates: Partial<StoredAttempt>): StoredAttempt | undefined {
    const attempts = getAttempts();
    const index = attempts.findIndex(a => a.id === id);
    if (index === -1) return undefined;

    attempts[index] = { ...attempts[index], ...updates };
    writeFile('attempts.json', attempts);
    return attempts[index];
}
