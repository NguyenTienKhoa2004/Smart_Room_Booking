import pino from "pino";

const pinoLogger = pino({
    level: "info",
});

// Create a wrapper that adapts console.log-style arguments to Pino's expected format
export const logger = {
    info: (...args: any[]) => {
        if (args.length === 0) return;
        if (args.length === 1) return pinoLogger.info(args[0]);
        if (typeof args[0] === 'string') {
            const [msg, ...rest] = args;
            pinoLogger.info({ data: rest }, msg);
        } else {
            pinoLogger.info({ data: args });
        }
    },
    error: (...args: any[]) => {
        if (args.length === 0) return;
        if (args.length === 1) return pinoLogger.error(args[0]);
        if (typeof args[0] === 'string') {
            const [msg, ...rest] = args;
            // if the second argument is an error, pino prefers error object first
            if (rest[0] instanceof Error) {
                pinoLogger.error(rest[0], msg);
            } else {
                pinoLogger.error({ data: rest }, msg);
            }
        } else {
            pinoLogger.error({ data: args });
        }
    },
    warn: (...args: any[]) => {
        if (args.length === 0) return;
        if (args.length === 1) return pinoLogger.warn(args[0]);
        if (typeof args[0] === 'string') {
            const [msg, ...rest] = args;
            pinoLogger.warn({ data: rest }, msg);
        } else {
            pinoLogger.warn({ data: args });
        }
    },
    debug: (...args: any[]) => {
        if (args.length === 0) return;
        if (args.length === 1) return pinoLogger.debug(args[0]);
        if (typeof args[0] === 'string') {
            const [msg, ...rest] = args;
            pinoLogger.debug({ data: rest }, msg);
        } else {
            pinoLogger.debug({ data: args });
        }
    },
};