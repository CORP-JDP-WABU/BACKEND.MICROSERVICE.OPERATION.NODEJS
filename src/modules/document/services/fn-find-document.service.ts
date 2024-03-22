import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import * as schemas from 'src/common/schemas';
import * as exceptions from 'src/exception';
import * as response from 'src/common/dto';
import { UserDecoratorInterface } from 'src/common/interfaces';

@Injectable()
export class FnFindDocumentService {
  private logger = new Logger(FnFindDocumentService.name);

  constructor(
    @InjectModel(schemas.UniversityCourseDoc.name)
    private readonly universityCourseDocModel: mongoose.Model<schemas.UniversityCourseDocDocument>
  ) {}

  async execute(
    idUniversity: string,
    idCourse: string,
    documentType: string,
    skipe: number,
    search: string,
    userDecorator: UserDecoratorInterface
  ) {
    this.logger.debug(`::start::execute::`);

    if (idUniversity.toString() !== userDecorator.idUniversity) {
      throw new exceptions.UnahutorizedUniversityCustomException('UNAUTHORIZED_UNIVERSITY');
    }

    try {
      const limit = 10;

      const countCourseDocuments = await this.universityCourseDocModel.countDocuments({
        idUniversity: mongoose.Types.ObjectId(idUniversity),
        'course.idCourse': mongoose.Types.ObjectId(idCourse),
        'document.documentType': documentType.toUpperCase(),
        $or: [
          { 'document.searchName': { $regex: search, $options: 'mi' } },
          { cicleName: { $regex: search, $options: 'mi' } }
        ]
      });

      const courseDocumentPromise = await this.universityCourseDocModel
        .find(
          {
            idUniversity: mongoose.Types.ObjectId(idUniversity),
            'course.idCourse': mongoose.Types.ObjectId(idCourse),
            'document.documentType': documentType.toUpperCase(),
            $or: [
              { 'document.searchName': { $regex: search, $options: 'mi' } },
              { cicleName: { $regex: search, $options: 'mi' } }
            ]
          },
          {
            _id: 1,
            document: 1,
            course: 1,
            teacher: 1,
            cicleName: 1
          }
        )
        .skip(skipe > 0 ? (skipe - 1) * limit : 0)
        .limit(limit);
      this.logger.debug(`::end::execute::${countCourseDocuments}`);
      return <response.ResponseGenericDto>{
        message: 'Processo exitoso',
        operation: `::${FnFindDocumentService.name}::execute`,
        data: {
          documents: courseDocumentPromise.map(x => {
            return {
              idDocument: x._id,
              originalName: x.document.originalName,
              documentType: x.document.documentType,
              extension: x.document.extension,
              url: x.document.url,
              student: x.document.student,
              course: {
                idCourse: x.course.idCourse,
                name: x.course.name
              },
              cicleName: x.cicleName,
              teacher: x.teacher
            };
          }),
          totalDocs: countCourseDocuments
        }
      };
    } catch (error) {
      this.logger.error(`::execute::error`, error);
      throw new exceptions.FindPaginationDocumentsException();
    }
  }

  async executeFindDoc(
    idUniversity: string,
    idCourse: string,
    idDocument: string,
    userDecorator: UserDecoratorInterface
  ) {
    if (idUniversity.toString() !== userDecorator.idUniversity) {
      throw new exceptions.UnahutorizedUniversityCustomException('UNAUTHORIZED_UNIVERSITY');
    }

    try {
      const universityCourseDoc = await this.universityCourseDocModel.findOne({
        'course.idCourse': mongoose.Types.ObjectId(idCourse),
        _id: mongoose.Types.ObjectId(idDocument)
      });

      const { document } = universityCourseDoc;
      const { student } = document;

      return <response.ResponseGenericDto>{
        message: 'Processo exitoso',
        operation: `::${FnFindDocumentService.name}::execute`,
        data: {
          idDocuemnt: universityCourseDoc.id,
          originalName: document.originalName,
          extension: document.extension,
          url: document.url,
          cicleName: universityCourseDoc.cicleName,
          student: {
            idStudent: student.idStudent,
            fullName: student.fullName,
            profileUrl: student.profileUrl
          }
        }
      };
    } catch (error) {
      this.logger.error(`::execute::error`, error);
      throw new exceptions.FindDocumentsException();
    }
  }
}
