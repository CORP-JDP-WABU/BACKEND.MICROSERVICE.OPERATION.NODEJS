import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as AWS from 'aws-sdk';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as schemas from 'src/common/schemas';
import * as exceptions from 'src/exception';
import * as response from 'src/common/dto';
import * as enums from 'src/common/enum';

@Injectable()
export class FnFindDocumentService {
    
    private logger = new Logger(FnFindDocumentService.name);
    
    constructor(
        @InjectModel(schemas.UniversityCourseDoc.name)
        private readonly universityCourseDocModel: mongoose.Model<schemas.UniversityCourseDocDocument>,
    ) {

    }

    async execute(idUniversity: string, idCourse: string, skipe: number, search: string) {
        this.logger.debug(`::start::execute::`);
        try {
            const limit = 10;

            const skip = (skipe - 1) * limit;

            const documents = await this.universityCourseDocModel.aggregate([
                { $unwind: "$documents" },
                /*{ $match: {
                    "idUniversity": mongoose.Types.ObjectId(idUniversity),
                    "course.idCourse": mongoose.Types.ObjectId(idCourse) 
                } },*/
                { $project: {
                    course: 1,
                    cicleName: 1,
                    documents: 1
                }},
                { $skip: skip }, 
                { $limit: limit }
            ]);

            return <response.ResponseGenericDto>{
                message: 'Processo exitoso',
                operation: `::${FnFindDocumentService.name}::execute`,
                data: {
                  documents,
                  totalDocument: documents.length
                }
              };
        } catch (error) {
            
        }
    }
}