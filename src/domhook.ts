export class DomHook {

  static getEventFunctions(obj): string[] {
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

  hook(root: HTMLElement) {
    Object.entries(this).forEach(([key, value], idx) => {
      // console.log(`got ${idx}: key=${key} value=${value}`);
      if (value == undefined) {
        let obj = root.querySelector(".hook_" + key);
        this[key] = obj;
      }
    });
    DomHook.getEventFunctions(this).forEach((value, idx) => {
      let functionName = value as string;
      console.log(`assigning ${idx} ${functionName}`);
      let parts = functionName.split("_on");
      if (parts.length < 2) return;
      console.log(parts);
      let assignedFunction = this[functionName].bind(this);
      root.querySelectorAll(".hook_" + parts[0]).forEach((element) => {
          element.addEventListener(parts[1], assignedFunction);
      })
    });
  }
}
