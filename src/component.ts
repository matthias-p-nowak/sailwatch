
/** @class WebComponent provides easy linkage between javascript and html elements */
export class WebComponent {

    /** The root element of the component */
    root: DocumentFragment | HTMLElement;

    /** 
     * retrieves all functions in the prototype chain that contain _on 
     * @returns {string[]} array of function names
    */
    static getEventFunctions(obj): string[] {
        let functions = new Set<string>();
        while (obj) {
            Object.getOwnPropertyNames(obj).forEach((key: string) => {
                if (key.includes('_on') && typeof obj[key] == 'function') {
                    functions.add(key);
                }
            });
            obj = Object.getPrototypeOf(obj);
        }
        return [...functions];
    }

    /** constructs a component from a template and connects properties and methods */
    static fromTemplate<T extends WebComponent>(this: new()=> T): T|null {
        console.log(`constructing ${this.name}`);
        const templateName = 'template_' + this.name;
        let template = document.getElementById(templateName) as HTMLTemplateElement;
        if (template == null) {
            console.log(`couldn't find template with id ${templateName}`);
            return null;
        }
        const ret = new this();
        ret.root  = template.content.cloneNode(true) as DocumentFragment;
        WebComponent.fillElement<T>(ret);
        return ret;
    }

    /** constructs a component from an element and connects properties and methods */
    static fromElement<T extends WebComponent>(this: new()=> T, elem: HTMLElement): T|null {
        if(elem == null)
            return null;
        const ret = new this();
        ret.root = elem;
        WebComponent.fillElement<T>(ret);
        return ret;
    }

    /** connects properties and methods */
    private static fillElement<T extends WebComponent>(ret: T) {
        Object.entries(ret).forEach(([key, value], idx) => {
            // console.log(`got ${idx}: key=${key} value=${value}`);
            if (value == undefined) {
                if( key == 'dialog') {
                    ret[key]=ret.root;
                }else{
                    // console.log(`trying to find .js_${key} class object`);
                    let obj = ret.root.querySelector('.js_' + key);
                    ret[key] = obj;
                }
            } else {
                console.log(`what is ${key}?`, value);
            }
        });
        WebComponent.getEventFunctions(ret).forEach((value, idx) => {
            let fn = value as string;
            console.log(`assigning ${idx} ${fn}`);
            let parts = fn.split('_on');
            let eventFn = 'on' + parts[1];
            let obj= ret[fn].bind(ret);
            ret[parts[0]][eventFn] = obj;
        });
    }
}
