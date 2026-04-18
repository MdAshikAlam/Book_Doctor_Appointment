import mongoose from "mongoose";

export const dbConnection = ()=>{
    console.log("Current process.env.MONGO_URI:", process.env.MONGO_URI);
    mongoose.connect("mongodb://mdashikalam:277236As@ac-meojre-shard-00-00.gjtary8.mongodb.net:27017,ac-meojmre-shard-00-01.gjtary8.mongodb.net:27017,ac-meojmre-shard-00-02.gjtary8.mongodb.net:27017/?ssl=true&replicaSet=atlas-w5olkc-shard-0&authSource=admin&appName=Cluster0&retryWrites=true",{
        dbName: process.env.DB_NAME,
        family: 4
    }).then(()=>{
        console.log("Connected to database!");
    }).catch(err=>{
        console.log(`Some error occured while connecting to database:${err}`)
    });
};