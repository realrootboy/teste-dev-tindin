import { Request, Response, Router } from 'express';
import auth from './middlewares/auth';

/*
    Controllers imports
*/
import { classesController } from './controllers/classes.controller';
import { commentsController } from './controllers/comments.controller';
import { sessionController } from './controllers/session.controller';

export const router = Router();

/*
    Adding routes from controllers
*/
router.get('/', (_req:Request, res:Response) => { res.send('❤️'); });

router.use('/sessions', sessionController);

router.use(auth);

router.use('/classes/comments', commentsController);
router.use('/classes', classesController);
