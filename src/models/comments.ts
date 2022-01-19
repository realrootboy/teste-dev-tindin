import { ObjectId } from 'mongodb';

export default class Comment {
    constructor(
        public id_class: ObjectId, 
        public comment: string,
        public date_created: Date,
        public id?: ObjectId,
    ) {}

    static validator() {
        return {
            $jsonSchema: {
                bsonType: "object",
                required: ["id_class", "comment"],
                additionalProperties: true,
                properties: {
                    _id: {},
                    id_class: {
                        bsonType: "objectId",
                        description: "'id_class' must be a ObjectId and is required",
                    },
                    comment: {
                        bsonType: "string",
                        description: "'comment' must be a string and is required",
                    },
                }
            }
        }
    }
}
