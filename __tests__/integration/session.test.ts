import User from './../../src/models/users';
import { connectToDb, collections } from './../../src/services/database.service';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

import request from 'supertest';

import Server from './../../src/server';
const app = (new Server()).app;
let client:MongoClient;

dotenv.config({
    path: '.env.test',
});

async function generateUser():Promise<User> {
    const user = new User('renan', 'renangomes.es@gmail.com', '123456');
    await collections.users.insertOne(user); 
    return user;
}

describe('Authentication', () => {

    beforeAll(async () => {
        client = await connectToDb();
    });
    beforeEach(async () => {
        await collections.users.deleteMany({});
    });
    afterAll(async () => {
        await client.close();
    });
    

    it('should authenticated with valid credentials', async () => {
        const user = await generateUser();

        const response = await request(app).post('/sessions').send({
            email: user.email, 
            password: user.password,
        });

        expect(response.status).toBe(200);

    });

    it('should not authenticated with invalid credentials', async () => {
        const user = await generateUser();

        const response = await request(app).post('/sessions').send({
            email: user.email, 
            password: user.password + 'asd',
        });


        expect(response.status).toBe(401);
    });

    it('should return jwt token when authenticated', async () => {
        const user = await generateUser();

        const response = await request(app).post('/sessions').send({
            email: user.email, 
            password: user.password,
        });


        expect(response.body).toHaveProperty('token');
    });

    it('should be able to access routes when authenticated', async () => {
        const user = await generateUser();

        const response = await request(app).post('/sessions').send({
            email: user.email, 
            password: user.password,
        });

        const route_response = await request(app).get('/classes')
            .set('Authorization', `Bearer ${response.body.token}`);
        
        expect(route_response.status).toBe(200);
    });

    it('should not be able to access routes when not authenticated', async () => {
        const user = await generateUser();

        const response = await request(app).post('/sessions').send({
            email: user.email, 
            password: user.password,
        });

        const route_response = await request(app).get('/classes');
        
        expect(route_response.status).toBe(401);
    });

});
