import fs from 'node:fs/promises';
import path from 'node:path';
export async function loadRoutes(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const res = path.resolve(dir, entry.name);
        if (entry.isDirectory()) {
            await loadRoutes(res);
        } else {
            import(res);
        }
    }
}