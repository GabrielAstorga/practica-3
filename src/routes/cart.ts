import { Router } from 'express';
import { getDb } from '../mongo';
import { carts, product, JwtPayload } from '../types';
import { ObjectId } from 'mongodb';
import { AuthRequest, verifyToken } from '../middleware/verifyToken';



const router = Router();
const collection = () => getDb().collection<carts>('carrito');
const collectionPoducto = () => getDb().collection<product>('productos');

router.get("/cart", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId as  string ;

    const carrito = await collection().findOne({ userId: new ObjectId(userId) });

    if (!carrito) {
      return res.status(404).json({ message: "Carrito vacío" });
    }

    res.status(200).json(carrito);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener el carrito" });
  }
});



router.put("/cart/add", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId as string;
    const { productId, quantity } = req.body as { productId: string; quantity: number };

    if (!productId || typeof productId !== "string" || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Campos inválidos" });
    }

    const product = await collectionPoducto().findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return res.status(404).json({ message: "El producto no existe" });
    }
    const stock = product.stock ?? 0;

    const carrito = await collection().findOne({ userId: new ObjectId(userId) });

    if (carrito) {
      const existingItem = carrito.items.find(
        (item: any) => item.productId.toString() === productId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > stock) {
          return res.status(400).json({ message: "has superado stock" });
        }
        existingItem.quantity = newQuantity;
      } else {
        if (quantity > stock) {
          return res.status(400).json({ message: "has superado stock" });
        }
        carrito.items.push({ productId: new ObjectId(productId), quantity });
      }

      await collection().updateOne(
        { userId: new ObjectId(userId) },
        { $set: { items: carrito.items } }
      );

      return res.status(200).json({ message: "Carrito actualizado", cart: carrito });
    }

    if (quantity > stock) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const newCart = {
      userId: new ObjectId(userId),
      items: [{ productId: new ObjectId(productId), quantity }],
      createdAt: new Date()
    };
    await collection().insertOne(newCart);
    return res.status(201).json({ message: "Carrito creado", cart: newCart });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al actualizar el carrito" });
  }
});

export default router;
