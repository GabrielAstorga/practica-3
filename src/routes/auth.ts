import dotenv from "dotenv";
dotenv.config();


import { Router } from 'express';
import { getDb } from '../mongo';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { user,JwtPayload } from '../types';




const router = Router();
const collection = () => getDb().collection<user>('usuario');
const SECRET   = process.env.SECRET
 





router.post('/auth/register', async (req, res) => {
    try {
        const fecha= new Date() ;
        const {username, email, password } = req.body as {username: string, email: string, password: string};
        
        if(typeof email !== "string" || email === undefined && typeof username !== "string" || username ===undefined){
            res.status(400).json({message: "Campos invalidos o faltantes"})
        }
        
        const users = collection();
        const existsEmail=await users.findOne({email:email});
        const existsUsername=await users.findOne({username:username});
        
        if (existsEmail) {
            return res.status(409).json({ message: 'El email ya existe' });
        };
        
        if (existsUsername) {
            return res.status(409).json({ message: 'El nombre de usuario ya existe' });
        }
        
        const regexEmail = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i
        
        if(!regexEmail.test(email)){
            return res.status(400).json({message:"este correo no es valido"})
        }

        const  passEncripta = await bcrypt.hash(password, 10);
        await users.insertOne({username:username, email: email, passwordHash: passEncripta, createdAt:fecha});
        res.status(201).json({ message: 'User created' });

    }catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }

});
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body as {email: string, password: string};
        const users = collection();
        const user = await users.findOne({email:email});
        if (!user) {
            return res.status(404).json({ message: 'Credenciales inválidas' });
        };
        const validPass = await bcrypt.compare(password, user.passwordHash);
        if (!validPass) {
            return res.status(404).json({ message: 'Credenciales inválidas' });
        }
        const token = jwt.sign({id: user._id?.toString()} as JwtPayload, SECRET as string, {
            expiresIn: "1h"
        });
        res.status(200).json({  token:token});
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});



export default router;