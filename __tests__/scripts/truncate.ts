import { collections, connectToDb } from './../../src/services/database.service';
import * as dotenv from 'dotenv';

dotenv.config({
    path: '.env.test',
});

connectToDb().then(async () => {
    await collections.classes.deleteMany({});
    await collections.comments.deleteMany({});
    await collections.users.deleteMany({});

    process.exit(0);
}).catch(error => {
    console.error(error);
    process.exit(1);
});