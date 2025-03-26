import { SailWatch } from './sailwatch';

declare global {
    interface Window{
        installApp: (ev: MouseEvent)=> void;
        resizeTextArea: ()=> void;
        sw: SailWatch;
    }   
}
