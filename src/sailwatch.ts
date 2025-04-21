import { TimeLine } from "./timeline";


class SailWatch {
    constructor() {
        console.log("SailWatch instantiated");
    }

    ping() {
        console.log("ping ping");
    }

}

export let sw: SailWatch = new SailWatch();
