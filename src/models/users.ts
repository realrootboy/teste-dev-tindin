import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

export default class User {
    constructor(
        public name: string,
        public email: string,
        public password: string,
        public _id?: ObjectId,
    ) {}

    public checkPassword(password:string):boolean {
        return this.password === password;
    }

    public generateToken():string {
        return jwt.sign({ _id: this._id }, process.env.JWT_SECRET || 'secret');
    }
}