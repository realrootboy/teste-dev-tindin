import { ObjectId } from 'mongodb';

export default class Classe {
    constructor(
        public name: string,
        public video: string, 
        public data_init: Date,
        public data_end: Date,
        public date_created: Date,
        public date_updated: Date,
        public total_comments: number,
        public id?: ObjectId,
        public _id?: ObjectId,
        public last_comment?: string,
        public last_comment_date?: Date,
        public comments?: Comment[],
    ) {}


    static validator() {
        return {
            $jsonSchema: {
                bsonType: "object",
                required: ["name", "video", "data_init", "data_end"],
                additionalProperties: true,
                properties: {
                    _id: {},
                    name: {
                        bsonType: "string",
                        description: "'name' must be a string and is required",
                    },
                    video: {
                        bsonType: "string",
                        description: "'video' must be a string and is required",
                    },
                    data_init: {
                        bsonType: "date",
                        description: "'data_init' must be a date and is required",
                    },
                    data_end: {
                        bsonType: "date",
                        description: "'data_end' must be a date and is required",
                    },

                }
            }
        }
    }
}
