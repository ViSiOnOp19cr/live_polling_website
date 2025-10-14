import type { Request } from 'express';
export interface extendedRequest extends Request{
    user?:{
        id:string;
        username:string;
        role:string;
    };
    userId?:string;
}