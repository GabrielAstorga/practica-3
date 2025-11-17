import express from "express";
import { connectMongoDB } from "./mongo";
import routerAutenticacion from "./routes/auth";
import routerProducuto from "./routes/products";
import routerCarro from "./routes/cart";

connectMongoDB();

const app = express();
app.use(express.json());
app.use("/api/", routerAutenticacion);
app.use("/api/", routerProducuto);
app.use("/api/", routerCarro);
app.listen(3000, () => console.log("El API ha comenzado baby"));