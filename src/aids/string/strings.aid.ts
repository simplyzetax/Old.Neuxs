import { v4 as uuidv4, validate } from 'uuid';

export namespace StringsHelper {

    export function decodeBase64(string: string): string {
        return Buffer.from(string, 'base64').toString();
    }

    export function encodeBase64(string: string): string {
        return Buffer.from(string).toString('base64');
    }

    export function capitalize(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    export function uuid(capitalize?: boolean): string {
        return capitalize ? StringsHelper.capitalize(uuidv4()) : uuidv4();
    }

    export function uuidRp(): string {
        return StringsHelper.uuid().replace(/-/ig, "");
    }

    export function valUuid(uuid: string): boolean {
        return validate(uuid);
    }

    export function dateAddTime(pdate: Date, number: number) {
        const date = pdate;
        date.setHours(date.getHours() + number);
    
        return date;
    }
    
    export function replaceAt(string: string, index: number, replacement: string) {
        return string.substr(0, index) + replacement + string.substr(index + replacement.length);
    }

}