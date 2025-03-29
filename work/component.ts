
export class WebComponent {

    element: HTMLElement;

    static getEventFunctions(obj) {
        let functions = new Set();
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

    static fromTemplate<T extends WebComponent>(this: new()=> T): T|null {
        console.log(`constructing ${this.name}`);
        const templateName = 'template_' + this.name;
        let template = document.getElementById(templateName) as HTMLTemplateElement;
        if (template == null) {
            console.log(`couldn't find template with id ${templateName}`);
            return null;
        }
        const ret = new this();
        let clonedNode = template.content.cloneNode(true) as DocumentFragment;
        ret.element  = clonedNode.firstElementChild as HTMLElement;
        WebComponent.fillElement<T>(ret);
        return ret;
    }

    static fromElement<T extends WebComponent>(this: new()=> T, elem: HTMLElement): T|null {
        if(elem == null)
            return null;
        const ret = new this();
        ret.element = elem;
        WebComponent.fillElement<T>(ret);
        return ret;
    }

    private static fillElement<T extends WebComponent>(ret: T) {
        Object.entries(ret).forEach(([key, value], idx) => {
            console.log(`got ${idx}: key=${key} value=${value}`);
            if (value == undefined) {
                console.log(`trying to find .js_${key} class object`);
                ret[key] = ret.element.querySelector('.js_' + key);
            } else {
                console.log(`what is ${key}?`, value);
            }
        });
        WebComponent.getEventFunctions(ret).forEach((value, idx) => {
            let fn = value as string;
            console.log(`assigning ${idx} ${fn}`);
            let parts = fn.split('_on');
            let eventFn = 'on' + parts[1];
            ret[parts[0]][eventFn] = ret[fn].bind(ret);
        });
    }
}

export class Start extends WebComponent {
    notice: HTMLSpanElement;
    pressme: HTMLButtonElement;
    pressme_onclick(event){
        console.log('got a click', event,this);
        this.pressme.innerText='okok';
    }
}

console.log('making x');
let x = Start.fromTemplate();
if (x) {
    console.log('got ', x);
    x.element.id='yellow';
    document.getElementById('main')?.append(x.element);
    x.notice.innerText='new notice';
    console.log(`x.element is ${x.element.id}`);
}

let y=Start.fromElement(document.getElementById('yellow')!);
y!.notice.innerText='submarine';