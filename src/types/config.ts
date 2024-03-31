import { z } from "zod";
import { configSchema } from "../aids/config/config.utility";

declare global {
    namespace NodeJS {
        interface Global {
            [key: string]: any;
            config: z.infer<typeof configSchema>;
        }
    }
}