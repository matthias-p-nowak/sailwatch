
/** @class WebComponent provides easy linkage between javascript and html elements */
export class WebComponent {

    /** The root element of the component */
    root: HTMLElement;
    /** place for storing the original data content */
    data: Object    ={ };

    /** 
     * retrieves all functions in the prototype chain that contain _on 
     * @returns {string[]} array of function names
    */
    static getEventFunctions(obj: any): string[] {
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

    /** 
     * constructs a component from a template and connects properties and methods 
     */
    static fromTemplate<T extends WebComponent>(this: new()=> T): T|null {
        console.log(`constructing ${this.name}`);
        const templateName = 'template_' + this.name;
        let template = document.getElementById(templateName) as HTMLTemplateElement;
        if (template == null) {
            console.log(`couldn't find template with id ${templateName}`);
            return null;
        }
        const component = new this();
        // Todo: testing with a template that contains empty text nodes
        component.root  = template.content.cloneNode(true) as HTMLDivElement;
        WebComponent.fillElement<T>(component);
        return component;
    }

    /** constructs a component from an element and connects properties and methods */
    static fromElement<T extends WebComponent>(this: new()=> T, elem: HTMLElement): T|null {
        if(elem == null)
            return null;
        const component = new this();
        component.root = elem;
        WebComponent.fillElement<T>(component);
        return component;
    }

    /** connects properties and methods */
    private static fillElement<T extends WebComponent>(component: T) {
        Object.entries(component).forEach(([key, value], idx) => {
            // console.log(`got ${idx}: key=${key} value=${value}`);
            if (value == undefined) {
                if( key == 'dialog') {
                    // special treatment of dialog - since there is only one
                    component[key]=component.root;
                }else{
                    let obj = component.root.querySelector('.js_' + key);
                    component[key] = obj;
                }
            } else {
                console.log(`what is ${key}?`, value);
            }
        });
        WebComponent.getEventFunctions(component).forEach((value, idx) => {
            let fn = value as string;
            console.log(`assigning ${idx} ${fn}`);
            let parts = fn.split('_on');
            if(parts.length < 2)
                return;
            let eventFn = 'on' + parts[1];
            let obj= component[fn].bind(component);
            component[parts[0]][eventFn] = obj;
        });
    }
}
