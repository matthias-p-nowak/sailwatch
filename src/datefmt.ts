
window.dateFmt = function(fmt: string, dt: Date) {
    return fmt.replace(/%[ymdhis]/g, (m)=>{
        switch(m){
            case '%y': return dt.getFullYear().toString().padStart(4,'0');
            case '%m': return (dt.getMonth()+1).toString().padStart(2,'0');
            case '%d': return dt.getDate().toString().padStart(2,'0');
            case '%h': return dt.getHours().toString().padStart(2,'0');
            case '%i': return dt.getMinutes().toString().padStart(2,'0');
            case '%s': return dt.getSeconds().toString().padStart(2,'0');
            default: return m; // Return the original match if it doesn't match any of the cases
        }
    });
}
