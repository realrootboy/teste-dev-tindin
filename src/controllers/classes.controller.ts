import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from "./../services/database.service";
import Classe from './../models/classes';

import LooseObject from './../interfaces/loose.object';

export const classesController = express.Router();

classesController.get("/", async (req: Request, res: Response) => {

    let filters:LooseObject = {};

    const name = req?.query?.name;
    const description = req?.query?.description;
    const data_init = req?.query?.data_init;
    const data_end = req?.query?.data_end;

    if (name) {
        filters.name = { $regex: '.*' + name.toString() + '.*' };
    }
    if(description) {
        filters.description = { $regex: '.*' + description.toString() + '.*' };
    }
    if(data_init) {
        filters.data_init = { $gte: new Date(data_init.toString()) };
    }
    if(data_end) {
        filters.data_end = { $lte: new Date(data_end.toString()) };
    }

    let page = req?.query?.page ? parseInt(req.query.page as string) : 1;
    if(page < 1 || page === NaN) page = 1;
    const page_limit = 50;


    try{
        const classes = (await collections.classes.find(filters).skip((page-1)*page_limit).limit(page_limit).toArray()) as unknown as Classe[];

        for(const classe of classes) {
            const last_comment = (await collections.comments.find({ id_class: classe._id }).sort({ date_created: -1 }).limit(1).toArray())[0];

            if(last_comment) {
                classe.last_comment = last_comment.comment;
                classe.last_comment_date = last_comment.date_created;
            }
        }

        res.status(200).send({
            currentPage: page,
            totalPages: Math.ceil(await collections.classes.countDocuments(filters) / page_limit),
            page_limit,
            classes
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

classesController.get("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        const query = { _id: new ObjectId(id) };
        const classe = (await collections.classes.findOne(query)) as unknown as Classe;

        const last_comments = (await collections.comments.find({ id_class: classe._id }).sort({ date_created: -1 }).limit(3).toArray()) as unknown as Comment[];

        classe.comments = last_comments;

        if (classe) {
            res.status(200).send(classe);
        }
    } catch (error) {
        res.status(404).send(`Unable to find classe with id: ${req.params.id} => ${error.message}`);
    }

});

classesController.post("/", async (req: Request, res: Response) => {
    try {
        const classe = req.body as Classe;
        
        classe.date_created = new Date();
        classe.data_init = new Date(classe.data_init);
        classe.data_end = new Date(classe.data_end);
        classe.total_comments = 0;

        const result = await collections.classes.insertOne(classe);

        result ? res.status(201).send(classe) : res.status(500).send("Unable to create classe");
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

classesController.put("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        const updatedClasse: Classe = req.body as Classe;

        updatedClasse.date_updated = new Date();
        
        if(req.body && req.body.data_init) updatedClasse.data_init = new Date(updatedClasse.data_init);
        if(req.body && req.body.data_end) updatedClasse.data_end = new Date(updatedClasse.data_end);

        const query = { _id: new ObjectId(id) };

        const result = await collections.classes.updateOne(query, { $set: updatedClasse});

        result ? res.status(200).send(`Classe with id: ${id} updated`) : res.status(500).send("Unable to update classe");

    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }

});

classesController.delete("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        const query = { _id: new ObjectId(id) };
        const result = await collections.classes.deleteOne(query);
    
        if (result && result.deletedCount) {
            res.status(202).send(`Classe with id: ${id} deleted`);
        } else if (!result) {
            res.status(400).send(`Unable to delete classe with id: ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Unable to find classe with id: ${id}`);
        }
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }

});
