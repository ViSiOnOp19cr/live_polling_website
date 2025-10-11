import type {Request, Response} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import prisma from '../db.ts'
import { jwt_scret } from '../config.ts'
 
type user = {
    id:string | null,
    username:string | null, 
    password:string | null,
    role:string | null,
}

export const signup = async(req:Request, res:Response)=>{

    const {username, password, role } = req.body;
    const salt = 6;
    if(!username || !password || !role){
        return res.status(400).json({error: 'Please provide username, password and role'});
    }
    if(role !== 'TEACHER' && role !== 'STUDENT'){
        return res.status(400).json({error: 'Role must be either TEACHER or STUDENT'});
    }
    const user = await prisma.user.findUnique({
        where:{
            username
        }
    });
    if(user){
        return res.status(400).json({error: 'User already exists'});
    }
    const hashpassword = await bcrypt.hash(password, salt);

    try{
        await prisma.user.create({
            data: {
                username,
                password:hashpassword,
                role
            }
        });
        return res.status(200).json({
            message:"user has been signed up succesfully"
        })
    }catch(e:any){
        res.status(500).json({
            error:e.message
        })
    }

}
export const login = async(req:Request, res:Response)=>{
    const {username, password} = req.body;
    if(!username || !password){
        return res.status(400).json({error: 'Please provide username and password'});
    }
    const user:user |  null = await prisma.user.findUnique({
        where:{
            username
        }
    });
    if(!user){
        return res.status(400).json({error: 'User does not exist'});
    }
    const isMatch = await bcrypt.compare(password, user.password!);
    if(!isMatch){
        return res.status(400).json({error: 'Invalid credentials'});
    }
    const token = jwt.sign({
        id:user.id,
    }, jwt_scret);

    if(!token){
        return res.status(500).json({error: 'Error generating token'});
    }
    return res.status(200).json({
        token,
        user:{
            id:user.id,
            username:user.username,
            role:user.role
        }
    })

}