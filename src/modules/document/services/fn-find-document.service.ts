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

    async execute(idUniversity: string, idCourse: string, documentType: string, skipe: number, search: string) {
        this.logger.debug(`::start::execute::`);
        try {
            const limit = 10;

            const countCourseDocuments = this.universityCourseDocModel.countDocuments({
                idUniversity: mongoose.Types.ObjectId(idUniversity),
                idCourse: mongoose.Types.ObjectId(idCourse),
                "document.documentType": documentType.toUpperCase(),
                $or: [
                    { searchName: { $regex: search, $options: 'mi' } },
                    { cicleName: { $regex: search, $options: 'mi' } }
                ]
            });
            
            const courseDocumentPromise = this.universityCourseDocModel
            .find(
              {
                idUniversity: mongoose.Types.ObjectId(idUniversity),
                idCourse: mongoose.Types.ObjectId(idCourse),
                "document.documentType": documentType.toUpperCase(),
                $or: [
                    { searchName: { $regex: search, $options: 'mi' } },
                    { cicleName: { $regex: search, $options: 'mi' } }
                ]
              }
            )
            .skip(skipe > 0 ? (skipe - 1) * limit : 0)
            .limit(limit);
            this.logger.debug(`::end::execute::${countCourseDocuments}`);
            return <response.ResponseGenericDto>{
                message: 'Processo exitoso',
                operation: `::${FnFindDocumentService.name}::execute`,
                data: {
                  documents: courseDocumentPromise,
                  totalDocument: countCourseDocuments
                }
              };
        } catch (error) {
            
        }
    }
}