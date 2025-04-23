export class Note {
  time: Date;
  note: string;
  getData(){
    return {time: this.time, note: this.note};
  }
}
