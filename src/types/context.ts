import { JSXNode } from "hono/jsx";
import { ApiError } from "../aids/error/error.utility";
import { User } from "../models/db/user";

declare module "hono" {
    interface Context {
        sendStatus: (status: number) => Response;
        sendError: (error: ApiError) => Response;
        sendIni: (ini: string) => Response;
        user: User | undefined;
    }
}
