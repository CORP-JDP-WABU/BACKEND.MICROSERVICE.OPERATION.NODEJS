import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import * as schemas from 'src/common/schemas';
import * as exceptions from 'src/exception';
import * as response from 'src/common/dto';
import * as request from '../dto';
import { QUALIFICATION } from 'src/common/const/comon.const';

@Injectable()
export class FnQualificationService {
  private logger = new Logger(FnQualificationService.name);

  constructor(
    @InjectModel(schemas.CareerCourseTeacher.name)
    private readonly careerCourseTeacherModel: mongoose.Model<schemas.CareerCourseTeacherDocument>,
    @InjectModel(schemas.UniversityTeacher.name)
    private readonly universityTeacherModel: mongoose.Model<schemas.UniversityTeacherDocument>,
    @InjectModel(schemas.HistoryQualificationStudent.name)
    private readonly historyQualificationStudent: mongoose.Model<schemas.HistoryQualificationStudentDocument>
  ) {}

  async execute(
    idCourse: string,
    idTeacher: string,
    userDecorator: any,
    requestQualificationDto: request.RequestQualificationDto
  ) {
    const { idStudent } = userDecorator;

    this.logger.debug(`::executeUniversity::parameters::${idStudent}-${idCourse}-${idTeacher}`);

    const careerCourseTeacherForStudent = await this.careerCourseTeacherModel.findOne({
      idStudent: new mongoose.Types.ObjectId(idStudent),
      'pendingToQualification.course.idCourse': idCourse,
      'pendingToQualification.teacher.idTeacher': idTeacher
    });

    if (careerCourseTeacherForStudent) {
      await this.updateCareerCourseTeacherForStudent(
        careerCourseTeacherForStudent,
        idCourse,
        idTeacher
      );
      this.updateUniversityTeacherQualification(idCourse, idTeacher, requestQualificationDto);
    } else {
      await this.updateHistoryQualificationForStudent(
        idStudent,
        idCourse,
        idTeacher,
        requestQualificationDto
      );
    }
    return <response.ResponseGenericDto>{
      message: 'Processo exitoso',
      operation: `::${FnQualificationService.name}::execute`,
      data: {
        isRemoveTeacherToList: true
      }
    };
  }

  private async updateCareerCourseTeacherForStudent(
    careerCourseTeacherForStudent: schemas.CareerCourseTeacherDocument,
    idCourse: string,
    idTeacher: string
  ) {
    const hasQualificationUpdate = careerCourseTeacherForStudent.pendingToQualification.find(
      elemento => elemento.course.idCourse == idCourse && elemento.teacher.idTeacher == idTeacher
    );

    hasQualificationUpdate.hasQualification = true;

    this.logger.debug(
      `::updateCareerCourseTeacherForStudent::pendingToQualification::before::${careerCourseTeacherForStudent.pendingToQualification.length}`
    );

    careerCourseTeacherForStudent.pendingToQualification =
      careerCourseTeacherForStudent.pendingToQualification.filter(
        elemento => elemento._id != hasQualificationUpdate._id
      );

    this.logger.debug(
      `::updateCareerCourseTeacherForStudent::pendingToQualification::after::${careerCourseTeacherForStudent.pendingToQualification.length}`
    );

    careerCourseTeacherForStudent.manyQualification =
      careerCourseTeacherForStudent.pendingToQualification.length;
    careerCourseTeacherForStudent.pendingToQualification.push(hasQualificationUpdate);

    this.logger.debug(
      `::updateCareerCourseTeacherForStudent::careerCourseTeacherForStudent::manyQualification::${careerCourseTeacherForStudent.manyQualification}`
    );
    await careerCourseTeacherForStudent.save();
  }

  private async updateHistoryQualificationForStudent(
    idStudent: string,
    idCourse: string,
    idTeacher: string,
    requestQualificationDto: any
  ) {
    this.logger.debug(`::updateHistoryQualificationForStudent::start`);

    const idStudentMongoose = mongoose.Types.ObjectId(idStudent);
    const idCourseMongoose = mongoose.Types.ObjectId(idCourse);
    const idTeacherMongoose = mongoose.Types.ObjectId(idTeacher);

    const historyQualificationStudent = await this.historyQualificationStudent.findOne({
      idStudent: idStudentMongoose,
      idCourse: idCourseMongoose,
      idTeacher: idTeacherMongoose,
      hasQualification: true
    });

    if (!historyQualificationStudent) {
      await this.historyQualificationStudent.create({
        idStudent: idStudentMongoose,
        idCourse: idCourseMongoose,
        idTeacher: idTeacherMongoose,
        hasComment: false,
        hasQualification: true,
        auditProperties: {
          status: {
            code: 1,
            description: 'REGISTER'
          },
          dateCreate: new Date(),
          dateUpdate: null,
          userCreate: 'STUDENT',
          userUpdate: null,
          recordActive: true
        }
      });

      this.updateUniversityTeacherQualification(idCourse, idTeacher, requestQualificationDto);
    } else {
      if (historyQualificationStudent.hasComment) {
        this.logger.warn(
          `::updateHistoryQualificationForStudent::historyQualificationStudent::${historyQualificationStudent.hasQualification}-${historyQualificationStudent.hasComment}`
        );
        throw new exceptions.NotExistStudentCareerCourseTeacherCustomException(
          `QUALIFICATION_NOT_EXISTS_STUDENT`
        );
      }
    }
    this.logger.debug(`::updateHistoryQualificationForStudent::end`);
  }

  private async updateUniversityTeacherQualification(
    idCourse: string,
    idTeacher: string,
    requestQualificationDto: request.RequestQualificationDto
  ) {
    const { required } = requestQualificationDto;

    this.logger.debug(`::start::updateUniversityTeacherQualification::${JSON.stringify(required)}`);

    const universityTeacher = await this.universityTeacherModel.findById(idTeacher);

    let operationQualificationMany = [];

    const course = universityTeacher.courses.find(course => course._id.toString() === idCourse);
    const requiredQualifications = course.requiredQualifications;
    const requiredOptionalQualifications = course.optionalQualifications;

    if (requiredQualifications.length > 0) {
      this.processRequiredQualifications(
        requiredQualifications,
        operationQualificationMany,
        requestQualificationDto,
        idTeacher,
        idCourse,
        this.geneateRequiredQualificationMany.bind(this)
      );

      if (operationQualificationMany.length > 0) {
        const averageQualification = (required.learn + required.hight + required.goodPeople) / 3;
        const newAverageQualification = this.calculateQualificationAverageNotRound(
          course.manyAverageQualifications,
          averageQualification
        );

        operationQualificationMany.push(
          this.generateRequiredAverage(idTeacher, idCourse, newAverageQualification)
        );
        await this.universityTeacherModel.bulkWrite(operationQualificationMany);
        operationQualificationMany = [];
      }

      if (requiredOptionalQualifications.length > 0) {
        const { optional } = requestQualificationDto;

        this.processOptionalQualifications(
          optional,
          operationQualificationMany,
          requiredOptionalQualifications,
          idTeacher,
          idCourse,
          this.geneateOptionalQualificationMany.bind(this)
        );
        if (operationQualificationMany.length > 0) {
          await this.universityTeacherModel.bulkWrite(operationQualificationMany);
          operationQualificationMany = [];
        }
      }
    }

    this.logger.debug(`::end::updateUniversityTeacherQualification::`);
  }

  private geneateOptionalQualificationMany(
    idTeacher: string,
    idCourse: string,
    qualificationCode: number,
    averageQualification: number
  ) {
    return {
      updateOne: {
        filter: {
          _id: new mongoose.Types.ObjectId(idTeacher),
          'courses._id': new mongoose.Types.ObjectId(idCourse)
        },
        update: {
          $set: {
            'courses.$[course].optionalQualifications.$[oq].averageQualification':
              averageQualification
          }
        },
        arrayFilters: [
          { 'course._id': new mongoose.Types.ObjectId(idCourse) },
          { 'oq.qualification.code': qualificationCode }
        ]
      }
    };
  }

  private geneateRequiredQualificationMany(
    idTeacher: string,
    idCourse: string,
    qualificationCode: number,
    averageQualification: number
  ) {
    return {
      updateOne: {
        filter: {
          _id: new mongoose.Types.ObjectId(idTeacher),
          'courses._id': new mongoose.Types.ObjectId(idCourse)
        },
        update: {
          $set: {
            'courses.$[course].requiredQualifications.$[oq].averageQualification':
              averageQualification
          }
        },
        arrayFilters: [
          { 'course._id': new mongoose.Types.ObjectId(idCourse) },
          { 'oq.qualification.code': qualificationCode }
        ]
      }
    };
  }

  private generateRequiredAverage(
    idTeacher: string,
    idCourse: string,
    averageQualifiction: number
  ) {
    return {
      updateOne: {
        filter: {
          _id: new mongoose.Types.ObjectId(idTeacher),
          'courses._id': new mongoose.Types.ObjectId(idCourse)
        },
        update: {
          $set: {
            'courses.$[course].manyAverageQualifications': averageQualifiction
          },
          $inc: {
            'courses.$[course].manyQualifications': 1
          }
        },
        arrayFilters: [{ 'course._id': new mongoose.Types.ObjectId(idCourse) }]
      }
    };
  }

  private calculateQualificationAverageRound(oldAverage: number, newValue: number) {
    const rawAverage =
      newValue == 0 ? oldAverage : oldAverage == 0 ? newValue : (oldAverage + newValue) / 2;
    return Number(rawAverage.toFixed(2));
  }

  private calculateQualificationAverageNotRound(oldAverage: number, newValue: number) {
    const rawAverage =
      newValue == 0 ? oldAverage : oldAverage == 0 ? newValue : (oldAverage + newValue) / 2;
    return rawAverage;
  }

  private processRequiredQualifications(
    requiredQualifications: any[],
    operationQualificationMany: any[],
    requestQualificationDto: request.RequestQualificationDto,
    idTeacher: string,
    idCourse: string,
    generateFunction: (idTeacher: string, idCourse: string, code: number, average: number) => any
  ) {
    const qualificationMapping = [
      { code: QUALIFICATION.REQUIRED.LEARN, attribute: 'learn' },
      { code: QUALIFICATION.REQUIRED.HIGHT, attribute: 'hight' },
      { code: QUALIFICATION.REQUIRED.GOOD_PEOPLE, attribute: 'goodPeople' }
    ];

    qualificationMapping.forEach(({ code, attribute }) => {
      const qualification = requiredQualifications.find(q => q.qualification.code === code);
      if (qualification) {
        const average = this.calculateQualificationAverageRound(
          qualification.averageQualification,
          requestQualificationDto.required[attribute]
        );

        operationQualificationMany.push(generateFunction(idTeacher, idCourse, code, average));
      }
    });
  }

  private processOptionalQualifications(
    optionalDto: any,
    qualifications: any[],
    operationQualificationMany: any[],
    idTeacher: string,
    idCourse: string,
    generateFunction: (idTeacher: string, idCourse: string, code: number, average: number) => any
  ) {
    const optionalQualificationsMapping = [
      { code: QUALIFICATION.OPTIONAL.ASSISTANCE, attribute: 'assistance' },
      { code: QUALIFICATION.OPTIONAL.LATE, attribute: 'late' },
      { code: QUALIFICATION.OPTIONAL.WORKED, attribute: 'worked' }
    ];

    optionalQualificationsMapping.forEach(({ code, attribute }) => {
      const value = optionalDto[attribute];

      if (value > 0) {
        const qualification = qualifications.find(q => q.qualification.code === code);

        if (qualification) {
          const average = this.calculateQualificationAverageRound(
            qualification.averageQualification,
            value
          );

          operationQualificationMany.push(generateFunction(idTeacher, idCourse, code, average));
        }
      }
    });
  }
}
