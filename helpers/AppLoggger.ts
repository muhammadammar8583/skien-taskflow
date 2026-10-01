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

export default AppLogger;