
export class EditStart {

    showEditor(): Promise<EditStart | string>{
        let esd=document.getElementById('editStart') as HTMLDialogElement;
        esd.showModal();
        let st=esd.querySelector('#editStartTime') as HTMLInputElement;
        let p=new Promise<EditStart>( (resolve,reject)=>{
        let dt=new Date(Date.now()+330_000);
        dt.setMilliseconds(0);
        let sec=dt.getSeconds();
        dt.setSeconds(sec>=30 ? 30: 0);
        try{
            //st.valueAsDate=dt;
            let str=dt.toString();
            console.log(`got ${str}`);
            st.defaultValue=str;//.slice(0,16);

        }catch(error){
            console.error(error);
            reject(error);
            esd.close();
        }
        let btn=esd.querySelector('#editTimeSubmit') as HTMLElement;
            btn.onclick=()=>{
                resolve(this);
                esd.close();
            };
        });
        return p;
    }

}

        