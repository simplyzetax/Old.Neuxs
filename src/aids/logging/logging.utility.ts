import chalk from 'chalk';

namespace Logger {
    export function info(message: any) {
        console.log(chalk.bgBlueBright.white('INFO') + chalk.white(` ${message}`));
    }

    export function warning(message: any) {
        console.log(chalk.bgYellow.white('WARNING') + chalk.white(` ${message}`));
    }

    export function error(message: any) {
        console.log(chalk.bgRed.white('ERROR') + chalk.white(` ${message}`));
    }

    export function success(message: any) {
        console.log(chalk.bgGreen.white('SUCCESS') + chalk.white(` ${message}`));
    }
}

export default Logger;