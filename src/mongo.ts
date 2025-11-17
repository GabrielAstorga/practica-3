import { Db, MongoClient } from "mongodb";




let client: MongoClient;
let dB: Db;
const dbName = "Tienda"

export const connectMongoDB = async (): Promise<void> => {
    try {
        client = new MongoClient("mongodb+srv://patataEspacial:patata@cluster0.klwnmxv.mongodb.net/?appName=Cluster0");
        await client.connect();
        dB = client.db(dbName);
        console.log("Connected to mongodb at db " + dbName);
    } catch (error) {
        console.log("Error mongo: ", error);
    }
};

export const getDb = ():Db => dB;