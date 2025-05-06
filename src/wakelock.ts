import { sailwatch } from "./sailwatch";
import { Sounds } from "./sounds";
import { TimeLine } from "./timeline";

export class WakeWaki{
    sentinel: WakeLockSentinel;
    keepAlive: boolean;
   

    private constructor (){
        console.log('created wakelock sentinel');
    }
    static _instance: WakeWaki = undefined;
    static get instance() { return this._instance || (this._instance=new WakeWaki());}
    
    private released(){
        console.log('wakelock released');
        if(this.keepAlive){
            Sounds.instance.play('bad');
            sailwatch.addError('wakelock released despite keep alive');
            this.checkRelease();
        }
    }

    checkRelease(){
        let tl=TimeLine.instance;
        this.keepAlive= tl.getStarts().length>0;
        if(this.keepAlive){
            this.run();
        }else{
            this.sentinel.release();
        }
    }

   async run() {
        console.log('wakelock');
        this.keepAlive=true;
        if ('wakeLock' in navigator){
            if(this.sentinel==undefined || this.sentinel.released){
                try{
                    this.sentinel =await navigator.wakeLock.request('screen');
                    this.sentinel.onrelease = this.released.bind(this);
                    console.log('wakelock aquired');
                    setTimeout(this.checkRelease.bind(this), 360_000);
                }catch(e){
                    console.log('wakelock failed');
                    sailwatch.addError(`wakelock failed ${e}`);
                }
            }
        }else{
            sailwatch.addInfo('wakelock not supported');
        }
    }

    checkStart(ce: CustomEvent){
        if(ce.detail.start != undefined){
            if(ce.detail.time > Date.now() && ce.detail.start == "planned"){
                this.run();
            }
        }
    }
}