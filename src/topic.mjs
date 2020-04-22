

export class Topic {
    constructor(service,name)
    {
        Object.defineProperties(this,{
          service : { value: service },
          name : { value: name }
        });
    }
}