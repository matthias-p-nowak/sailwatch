/**
 * DomHook is used to hook DOM elements to functions and members
 */
export class DomHook {
  root: HTMLDivElement;
  /**
   * provides a list of member functions that contain '_on'
   * @param obj class object
   * @returns list of function names
   */
  private static getEventFunctions(obj): string[] {
    let functions = new Set<string>();
    while (obj) {
      Object.getOwnPropertyNames(obj).forEach((key: string) => {
        if (key.includes("_on") && typeof obj[key] == "function") {
          functions.add(key);
        }
      });
      obj = Object.getPrototypeOf(obj);
    }
    return [...functions];
  }

  /**
   * should be called once in the constructor
   * @param element the element that contains all the hooks
   * will traverse the prototype chain, and assign any functions that contain _on to their respective event handlers
   * and assign any undefined values to their respective queried elements
   */
  hook(root: HTMLElement) {
    this.root=root;
    // hooking properties
    Object.entries(this).forEach(([key, value], idx) => {
      // console.log(`got ${idx}: key=${key} value=${value}`);
      if (value == undefined) {
        let obj = root.querySelector(".hook_" + key);
        this[key] = obj;
      }
    });
    // hooking functions
    DomHook.getEventFunctions(this).forEach((value, idx) => {
      let functionName = value as string;
      //   console.log(`assigning ${idx} ${functionName}`);
      let parts = functionName.split("_on");
      if (parts.length < 2) return;
      //   console.log(parts);
      let assignedFunction = this[functionName].bind(this);
      root.querySelectorAll(".hook_" + parts[0]).forEach((element) => {
        element.addEventListener(parts[1], assignedFunction);
      });
      let idElement = document.getElementById(parts[0]);
      if (idElement) {
        idElement.addEventListener(parts[1], assignedFunction);
      }
    });
  }

  static fromTemplate(name: string): HTMLElement {
    let template = document.getElementById(name) as HTMLTemplateElement;
    if (template == null) {
      throw new Error(`couldn't find template with id ${name}`);
    }
    let cloned =
      template.content.firstElementChild?.cloneNode(true) || template.content.cloneNode(true);
    return cloned as HTMLElement;
  }
}
