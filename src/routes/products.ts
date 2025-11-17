import { Router } from 'express';
import { getDb } from '../mongo';
import { product } from '../types';
import { AuthRequest, verifyToken } from '../middleware/verifyToken';


const router = Router();
const collection = () => getDb().collection<product>('productos');

router.get("/products",async(req,res)=>{
    try{
        const productos= await collection().find().toArray();
        res.status(200).json(productos);
    }catch(err){
        res.status(500).json({message:"Error al obtener los productos"});
        }
})

router.post("/products",verifyToken,async (req: AuthRequest,res)=>{
    try{
    const {name,description,price,stock}=req.body as {name:string,description?:string,price:number, stock:number};

    if(typeof name!== "string"|| name ===undefined && typeof description !== "string" && 
        typeof price !== "number"|| price === undefined || price <1 &&
        typeof stock !=="number" || stock === undefined || stock<0 ){
             res.status(400).json({message:"Campos invalidos o faltantes"})

    }
    const productos = collection();
    await productos.insertOne({ name: name ,description: description, price: price, stock:stock, createdAt: new Date()});
    res.status(201).json({message:"el producto se ha creado"})
    }catch(err){
        res.status(500).json({
            message: "Error interno del servidor",
            
        })
    }
    
})
export default router;