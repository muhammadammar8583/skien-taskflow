const AppLogger = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${message}]`, data);
    }
}

AppLogger.info = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.info(`[INFO] ${message}`, data);
    }
}
AppLogger.error = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.error(`[ERROR] ${message}`, data);
    }
}
AppLogger.warn = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.warn(`[WARN] ${message}`, data);
    }
}
AppLogger.debug = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.debug(`[DEBUG] ${message}`, data);
    }
}
AppLogger.trace = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.trace(`[TRACE] ${message}`, data);
    }
}
AppLogger.fatal = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.fatal(`[FATAL] ${message}`, data);
    }
}
AppLogger.critical = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.critical(`[CRITICAL] ${message}`, data);
    }
}
AppLogger.emergency = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.emergency(`[EMERGENCY] ${message}`, data);
    }
}
AppLogger.alert = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.alert(`[ALERT] ${message}`, data);
    }
}
AppLogger.notice = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.notice(`[NOTICE] ${message}`, data);
    }
}

export default AppLogger;