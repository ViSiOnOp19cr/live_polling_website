import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {jwt_scret} from '../config.ts';
import prisma from '../db.ts';
import type { extendedRequest } from '../types.ts';

export const authMiddleware = async(req:extendedRequest, res:Response, next:NextFunction) =>{
    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).json({
            message:'Unauthorized'
        })
    }
    const decoded = jwt.verify(token, jwt_scret) as {id:string};
    if(!decoded){
        return res.status(401).json({
            message:'Unauthorized'
        })
    }
    const user = await prisma.user.findUnique({
        where:{
            id:decoded.id
        },
        select:{
            id:true,
            username:true,
            role:true
        }
    });
    if(!user){
        return res.status(401).json({
            message:'Unauthorized'
        })
    }
    req.user = user;
    req.userId = user.id;
    next();
}