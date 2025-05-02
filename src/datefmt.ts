
export function dateFmt(fmt: string, dt: Date) {
    // console.log("dateFmt", fmt, dt);
    return fmt.replace(/%[ymdHhisf]/g, (m) => {
        switch (m) {
            case '%y': return dt.getFullYear().toString().padStart(4, '0');
            case '%m': return (dt.getMonth() + 1).toString().padStart(2, '0');
            case '%d': return dt.getDate().toString().padStart(2, '0');
            case '%H': return ((dt.getDate() - 1) * 24 + dt.getHours()).toString().padStart(2, '0');
            case '%h': return dt.getHours().toString().padStart(2, '0');
            case '%i': return dt.getMinutes().toString().padStart(2, '0');
            case '%s': return dt.getSeconds().toString().padStart(2, '0');
            case '%f': return dt.getMilliseconds().toString().padStart(3, '0');
            default: return m; // Return the original match if it doesn't match any of the cases
        }
    });
}

export function untilNext(dt: Date, addSeconds: number) {
    dt.setSeconds(dt.getSeconds() + addSeconds);
    dt.setMilliseconds(0);
    let now = new Date();
    return dt.getTime() - now.getTime();
}