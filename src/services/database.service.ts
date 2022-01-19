import * as mongoDB from 'mongodb';


import Classe from './../models/classes';
import Comment from './../models/comments';

async function loadValidators(db:mongoDB.Db) {
    
    await db.command({
        collMod: process.env.CLASSES_COLLECTION_NAME,
        validator: Classe.validator()
    });

    await db.command({
        collMod: process.env.COMMENTS_COLLECTION_NAME,
        validator: Comment.validator()
    });
}

async function createCollections(db:mongoDB.Db) {
    const checkAndCreate = async (name: string) => {
        try{
            await db.createCollection(name);
        } catch(err) {}
    }
    
    checkAndCreate(process.env.CLASSES_COLLECTION_NAME);
    checkAndCreate(process.env.COMMENTS_COLLECTION_NAME);
    checkAndCreate(process.env.USER_COLLECTION_NAME);
}

export async function connectToDb () {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING);

    await client.connect();

    const db: mongoDB.Db = client.db(process.env.DB_NAME);

    await createCollections(db);
    await loadValidators(db);
    
    const classesCollection: mongoDB.Collection = db.collection(process.env.CLASSES_COLLECTION_NAME);
    const commentsCollection: mongoDB.Collection = db.collection(process.env.COMMENTS_COLLECTION_NAME);
    const usersCollection: mongoDB.Collection = db.collection(process.env.USERS_COLLECTION_NAME);
    
    collections.classes = classesCollection;
    collections.comments = commentsCollection;
    collections.users = usersCollection;
    
    
    /*console.log(`Successfully connected to database: ${db.databaseName}`);
    console.log(` and collection: ${classesCollection.collectionName}`);
    console.log(` and collection: ${commentsCollection.collectionName}`);
    console.log(` and collection: ${usersCollection.collectionName}`);*/
    return client;
}

export const collections: { 
    classes?: mongoDB.Collection, 
    comments?: mongoDB.Collection,
    users?: mongoDB.Collection,
} = {};
