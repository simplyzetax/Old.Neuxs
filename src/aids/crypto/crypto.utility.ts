import crypto from 'node:crypto';

export namespace CryptoHelper {

    export function sha256(data: any): string {
        const hasher = new Bun.CryptoHasher("sha256");
        hasher.update(data);
        hasher.digest();

        return hasher.digest("hex");
    }

    export function sha1(data: any): string {
        const hasher = new Bun.CryptoHasher("sha1");
        hasher.update(data);
        hasher.digest();

        return hasher.digest("hex");
    }

    export function md5(data: any): string {
        const hasher = new Bun.CryptoHasher("md5");
        hasher.update(data);
        hasher.digest();

        return hasher.digest("hex");
    }

    export async function hashPassword(plaintextPassword: string): Promise<string> {
        return await Bun.password.hash(plaintextPassword);
    }

    export async function verifyPassword(password: string, hash: string): Promise<boolean> {
        return await Bun.password.verify(password, hash);
    }

    export function encrypt(data: string, password: string): string {
        const iv = crypto.randomBytes(16);
        const key = crypto.scryptSync(password, 'salt', 32);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }

    export function decrypt(data: string, password: string): string {
        const textParts = data.split(':');
        const iv = Buffer.from(textParts.shift()!, 'hex');
        const key = crypto.scryptSync(password, 'salt', 32);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(textParts.join(':'), 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

}