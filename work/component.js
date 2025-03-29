export class WebComponent {
  element;
  static getEventFunctions(obj) {
    let functions = /* @__PURE__ */ new Set();
    while (obj) {
      Object.getOwnPropertyNames(obj).forEach((key) => {
        if (key.includes("_on") && typeof obj[key] == "function") {
          functions.add(key);
        }
      });
      obj = Object.getPrototypeOf(obj);
    }
    return [...functions];
  }
  static fromTemplate() {
    console.log(`constructing ${this.name}`);
    const templateName = "template_" + this.name;
    let template = document.getElementById(templateName);
    if (template == null) {
      console.log(`couldn't find template with id ${templateName}`);
      return null;
    }
    const ret = new this();
    ret.element = template.content.cloneNode(true);
    Object.entries(ret).forEach(([key, value], idx) => {
      console.log(`got ${idx}: key=${key} value=${value}`);
      if (value == void 0) {
        console.log(`trying to find .js_${key} class object`);
        ret[key] = ret.element.querySelector(".js_" + key);
      } else {
        console.log(`what is ${key}?`, value);
      }
    });
    WebComponent.getEventFunctions(ret).forEach((value, idx) => {
      let fn = value;
      console.log(`assigning ${idx} ${fn}`);
      let parts = fn.split("_on");
      let eventFn = "on" + parts[1];
      ret[parts[0]][eventFn] = ret[fn].bind(ret);
    });
    return ret;
  }
}
export class Start extends WebComponent {
  notice;
  pressme;
  pressme_onclick(event) {
    console.log("got a click", event, this);
  }
}
console.log("making x");
let x = Start.fromTemplate();
if (x) {
  console.log("got ", x);
  document.getElementById("main")?.append(x.element);
  x.notice.innerText = "new notice";
}
