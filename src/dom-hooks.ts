
export class DomHook {

    /** 
     * retrieves all functions in the prototype chain that contain _on 
     * @returns {string[]} array of function names
    */
    getEventFunctions(): string[] {
        let functions = new Set<string>();
        let obj = this;
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
     * @param element the element that contains all the hooks
     * will traverse the prototype chain, and assign any functions that contain _on to their respective event handlers
     * and assign any undefined values to their respective queried elements
     */
    hook(element: HTMLElement) {
        // hooking properties
        Object.entries(this).forEach(([key, value], idx) => {
            // console.log(`got ${idx}: key=${key} value=${value}`);
            if (value == undefined) {
                let obj = element.querySelector('.hook_' + key);
                this[key] = obj;
            }
        });
        // hooking functions
        this.getEventFunctions().forEach((value, idx) => {
            let functionName = value as string;
            console.log(`assigning ${idx} ${functionName}`);
            let parts = functionName.split('_on');
            if (parts.length < 2)
                return;
            let eventFunction = 'on' + parts[1];
            let assignedFunction = this[functionName].bind(this);
            this[parts[0]][eventFunction] = assignedFunction;
        });
    }

    /**
     *  creates a new DOM-element from a template and assigns the hooks
     */
    fromTemplate<T extends DomHook>(this: T): HTMLElement | null {
        console.log(`constructing ${this.constructor.name}`);
        let templateName = 'template_' + this.constructor.name;
        templateName = templateName.replace('__', '_');
        let template = document.getElementById(templateName) as HTMLTemplateElement;
        if (template == null) {
            throw new Error(`couldn't find template with id ${templateName}`);
        }
        let cloned = template.content.firstElementChild?.cloneNode(true) || template.content.cloneNode(true);
        this.hook(cloned as HTMLElement);
        return cloned as HTMLElement;
    }

}