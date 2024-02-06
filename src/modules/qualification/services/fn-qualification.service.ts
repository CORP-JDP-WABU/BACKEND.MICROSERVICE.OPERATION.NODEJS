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
  ) {}

  async execute(
    idCourse: string,
    idTeacher: string,
    userDecorator: any,
    requestQualificationDto: request.RequestQualificationDto,
  ) {
    const { idStudent } = userDecorator;

    this.logger.debug(
      `::executeUniversity::parameters::${idCourse}-${idTeacher}`,
    );

    const careerCourseTeacherForStudent =
      await this.careerCourseTeacherModel.findOne({
        idStudent: new mongoose.Types.ObjectId(idStudent),
        'pendingToQualification.course.idCourse': idCourse,
        'pendingToQualification.teacher.idTeacher': idTeacher,
      });

    if (!careerCourseTeacherForStudent) {
      throw new exceptions.NotExistStudentCareerCourseTeacherCustomException(`QUALIFICATION_NOT_EXISTS_STUDENT`);
    }

    const hasQualificationUpdate = careerCourseTeacherForStudent.pendingToQualification.find(
      (elemento) =>
        elemento.course.idCourse == idCourse && elemento.teacher.idTeacher == idTeacher
    );
    
    hasQualificationUpdate.hasQualification = true;

    careerCourseTeacherForStudent.pendingToQualification =
      careerCourseTeacherForStudent.pendingToQualification.filter(
        (elemento) =>
          elemento.course.idCourse !== idCourse &&
          elemento.teacher.idTeacher !== idTeacher,
      );

    careerCourseTeacherForStudent.pendingToQualification.push(hasQualificationUpdate);

    await careerCourseTeacherForStudent.save();

    await this.updateUniversityTeacherQualification(
      idCourse,
      idTeacher,
      requestQualificationDto,
    );

    return <response.ResponseGenericDto>{
      message: 'Processo exitoso',
      operation: `::${FnQualificationService.name}::execute`,
      data: {
        isRemoveTeacherToList: true,
      },
    };
  }

  private async updateUniversityTeacherQualification(
    idCourse: string,
    idTeacher: string,
    requestQualificationDto: request.RequestQualificationDto,
  ) {

    const { required } = requestQualificationDto;

    const universityTeacher = await this.universityTeacherModel.findById(
      idTeacher,
    );

    let operationQualificationMany = [];

    const course = universityTeacher.courses.find(
      (course) => course._id.toString() === idCourse,
    );
    const requiredQualifications = course.requiredQualifications;
    const requiredOptionalQualifications = course.optionalQualifications;

    if (requiredQualifications.length > 0) {
      const lern = requiredQualifications.find(
        (required) =>
          required.qualification.code == QUALIFICATION.REQUIRED.LEARN,
      );
      const averageLern = this.calculateQualificationAverageRound(
        lern.averageQualification,
        requestQualificationDto.required.learn,
      );
      operationQualificationMany.push(
        this.geneateRequiredQualificationMany(
          idTeacher,
          idCourse,
          QUALIFICATION.REQUIRED.LEARN,
          averageLern,
        ),
      );

      const hight = requiredQualifications.find(
        (required) =>
          required.qualification.code == QUALIFICATION.REQUIRED.HIGHT,
      );
      const averageHight = this.calculateQualificationAverageRound(
        hight.averageQualification,
        requestQualificationDto.required.hight,
      );
      operationQualificationMany.push(
        this.geneateRequiredQualificationMany(
          idTeacher,
          idCourse,
          QUALIFICATION.REQUIRED.HIGHT,
          averageHight,
        ),
      );

      const good = requiredQualifications.find(
        (required) =>
          required.qualification.code == QUALIFICATION.REQUIRED.GOOD_PEOPLE,
      );
      const averageGood = this.calculateQualificationAverageRound(
        good.averageQualification,
        requestQualificationDto.required.goodPeople,
      );
      operationQualificationMany.push(
        this.geneateRequiredQualificationMany(
          idTeacher,
          idCourse,
          QUALIFICATION.REQUIRED.GOOD_PEOPLE,
          averageGood,
        ),
      );

      if (operationQualificationMany.length > 0) {
        const averageQualification = (required.learn + required.hight + required.goodPeople);  
        const newAverageQualification = this.calculateQualificationAverageNotRound(course.manyAverageQualifications, averageQualification);
        operationQualificationMany.push(this.generateRequiredAverage(idTeacher, idCourse, newAverageQualification));
        await this.universityTeacherModel.bulkWrite(operationQualificationMany);
        operationQualificationMany = [];
      }

      if (requiredOptionalQualifications.length > 0) {
        const { optional } = requestQualificationDto;
        const { assistance, late, worked } = optional;
        if (assistance > 0) {
          const optionalAssistance = requiredOptionalQualifications.find(
            (required) =>
              required.qualification.code == QUALIFICATION.OPTIONAL.ASSISTANCE,
          );
          const averageAssistance = this.calculateQualificationAverageRound(
            optionalAssistance.averageQualification,
            requestQualificationDto.optional.assistance,
          );
          operationQualificationMany.push(
            this.geneateOptionalQualificationMany(
              idTeacher,
              idCourse,
              QUALIFICATION.OPTIONAL.ASSISTANCE,
              averageAssistance,
            ),
          );
        }

        if (late > 0) {
          const optionalLate = requiredOptionalQualifications.find(
            (required) =>
              required.qualification.code == QUALIFICATION.OPTIONAL.LATE,
          );
          const averageLate = this.calculateQualificationAverageRound(
            optionalLate.averageQualification,
            requestQualificationDto.optional.late,
          );
          operationQualificationMany.push(
            this.geneateOptionalQualificationMany(
              idTeacher,
              idCourse,
              QUALIFICATION.OPTIONAL.LATE,
              averageLate,
            ),
          );
        }

        if (worked > 0) {
          const optionalWork = requiredOptionalQualifications.find(
            (required) =>
              required.qualification.code == QUALIFICATION.OPTIONAL.WORKED,
          );
          const averageWork = this.calculateQualificationAverageRound(
            optionalWork.averageQualification,
            requestQualificationDto.optional.worked,
          );
          operationQualificationMany.push(
            this.geneateOptionalQualificationMany(
              idTeacher,
              idCourse,
              QUALIFICATION.OPTIONAL.WORKED,
              averageWork,
            ),
          );
        }

        if (operationQualificationMany.length > 0) {
          await this.universityTeacherModel.bulkWrite(operationQualificationMany);
          operationQualificationMany = [];
        }
      }
    } else {
      this.createUniversityTeacherQualification();
    }
  }


  private async createUniversityTeacherQualification() {}

  private geneateOptionalQualificationMany(
    idTeacher: string,
    idCourse: string,
    qualificationCode: number,
    averageQualification: number,
  ) {
    return {
      updateOne: {
        filter: {
          _id: new mongoose.Types.ObjectId(idTeacher),
          'courses._id': new mongoose.Types.ObjectId(idCourse),
        },
        update: {
          $set: {
            'courses.$[course].optionalQualifications.$[oq].averageQualification':
              averageQualification,
          }
        },
        arrayFilters: [
          { 'course._id': new mongoose.Types.ObjectId(idCourse) },
          { 'oq.qualification.code': qualificationCode }],
      },
    };
  }

  private geneateRequiredQualificationMany(
    idTeacher: string,
    idCourse: string,
    qualificationCode: number,
    averageQualification: number,
  ) {
    return {
      updateOne: {
        filter: {
          _id: new mongoose.Types.ObjectId(idTeacher),
          'courses._id': new mongoose.Types.ObjectId(idCourse),
        },
        update: {
          $set: {
            'courses.$[course].requiredQualifications.$[oq].averageQualification':
              averageQualification,
          },
        },
        arrayFilters: [
          { 'course._id': new mongoose.Types.ObjectId(idCourse) },
          { 'oq.qualification.code': qualificationCode }],
      },
    };
  }

  private generateRequiredAverage(    idTeacher: string,
    idCourse: string, averageQualifiction: number) {
      return {
        updateOne: {
          filter: {
            _id: new mongoose.Types.ObjectId(idTeacher),
            'courses._id': new mongoose.Types.ObjectId(idCourse),
          },
          update: {
            $set: {
              'courses.$[course].manyAverageQualifications':  averageQualifiction
            },
            $inc: {
              'courses.$[course].manyQualifications':  1
            }
          },
          arrayFilters: [
            { 'course._id': new mongoose.Types.ObjectId(idCourse) }
          ]
        },
      };
  }

  private calculateQualificationAverageRound(oldAverage: number, newValue: number) {
    const rawAverage = (oldAverage + newValue) / 2;
    return Math.round(rawAverage);
  }

  private calculateQualificationAverageNotRound(oldAverage: number, newValue: number) {
    const rawAverage = (oldAverage + newValue) / 2;
    return rawAverage
  }
}
