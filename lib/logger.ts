import "server-only";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const formatTimestamp = (): string => new Date().toISOString();

const formatLog = (
  level: LogLevel,
  message: string,
  context?: LogContext
): string => {
  const base = {
    timestamp: formatTimestamp(),
    level,
    message,
    ...(context ? { ...context } : {}),
  };

  return JSON.stringify(base);
};

const log = (
  level: LogLevel,
  message: string,
  context?: LogContext
): void => {
  const formatted = formatLog(level, message, context);

  if (level === "error") {
    console.error(formatted);
  } else if (level === "warn") {
    // eslint-disable-next-line no-console
    console.warn(formatted);
  } else {
    // eslint-disable-next-line no-console
    console.log(formatted);
  }
};

export const logger = {
  debug: (message: string, context?: LogContext): void =>
    log("debug", message, context),

  info: (message: string, context?: LogContext): void =>
    log("info", message, context),

  warn: (message: string, context?: LogContext): void =>
    log("warn", message, context),

  error: (message: string, context?: LogContext): void =>
    log("error", message, context),
};
