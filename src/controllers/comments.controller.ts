import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from './../services/database.service';
import Comment from './../models/comments';
import Classe from './../models/classes';

export const commentsController = express.Router();

commentsController.get("/", async (req: Request, res: Response) => {
    const id_class = req?.query?.id_class;
    if(!id_class) {
        res.status(400).send("Missing id_class query param");
        return;
    }

    let page = req?.query?.page ? parseInt(req.query.page as string) : 1;
    if(page < 1 || page === NaN) page = 1;
    const page_limit = 50;

    try {
        const comments = (await collections.comments.find({ id_class: new ObjectId(id_class + '') }).skip((page-1)*page_limit).limit(page_limit).toArray()) as unknown as Comment[];
        res.status(200).send({
            currentPage: page,
            totalPages: Math.ceil(await collections.comments.countDocuments({ id_class: new ObjectId(id_class + '') }) / page_limit),
            page_limit,
            comments
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

commentsController.post("/", async (req: Request, res: Response) => {
    const id_class = req?.query?.id_class;
    if(!id_class) {
        res.status(400).send("Missing id_class query param");
        return;
    }

    try {
        const comment = req.body as Comment;

        comment.date_created = new Date();
        comment.id_class = new ObjectId(id_class + '');

        const result = await collections.comments.insertOne(comment);

        if(result) {
            const classe = (await collections.classes.findOne({ _id: comment.id_class })) as unknown as Classe;

            classe.data_init = new Date(classe.data_init);
            classe.data_end = new Date(classe.data_end);
            classe.total_comments =  classe.total_comments + 1;

            await collections.classes.updateOne({ _id: classe._id }, {$set: classe});

            res.status(201).send(comment);
        } else {
            res.status(500).send("Unable to create comment");
        }

    } catch (error) {
        console.error(error.errInfo.details.schemaRulesNotSatisfied[0]);
        res.status(400).send(error.message);
    }
});

commentsController.delete("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try{
        const query = { _id: new ObjectId(id) };

        const comment = (await collections.comments.findOne(query)) as unknown as Comment;
        const result = await collections.comments.deleteOne(query);
       
        if(result && result.deletedCount) {
            const classe = (await collections.classes.findOne({ _id: comment.id_class })) as unknown as Classe;

            classe.data_init = new Date(classe.data_init);
            classe.data_end = new Date(classe.data_end);
            classe.total_comments =  classe.total_comments - 1;

            await collections.classes.updateOne({ _id: classe._id }, {$set: classe});

            res.status(202).send(`Comment with id: ${id} deleted`);
        } else if (!result) {
            res.status(400).send(`Unable to delete comment with id: ${id}`);
        } else if (!result.deletedCount) {
            res.status(400).send(`Unable to find comment with id: ${id}`);
        }
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});
