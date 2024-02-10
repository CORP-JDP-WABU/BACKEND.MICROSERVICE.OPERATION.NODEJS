import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import * as schemas from 'src/common/schemas';
import * as exceptions from 'src/exception';
import * as response from 'src/common/dto';

@Injectable()
export class FnQualificationIgnorantService {
  private logger = new Logger(FnQualificationIgnorantService.name);

  constructor(
    @InjectModel(schemas.CareerCourseTeacher.name)
    private readonly careerCourseTeacherModel: mongoose.Model<schemas.CareerCourseTeacherDocument>,
  ) {}

  async execute(idCourse: string, idTeacher: string, userDecorator: any) {
    const { idStudent } = userDecorator;

    this.logger.debug(`::execute::parameters::${idCourse}-${idTeacher}`);

    const careerCourseTeacherForStudent =
      await this.careerCourseTeacherModel.findOne({
        idStudent: new mongoose.Types.ObjectId(idStudent),
        'pendingToQualification.course.idCourse': idCourse,
        'pendingToQualification.teacher.idTeacher': idTeacher,
      });

    if (!careerCourseTeacherForStudent) {
      throw new exceptions.NotExistStudentCareerCourseTeacherCustomException(
        `QUALIFICATION_NOT_EXISTS_STUDENT`,
      );
    }

    this.logger.debug(
      `::pendingToQualification::before::${careerCourseTeacherForStudent.pendingToQualification.length}`,
    );
    const deletePendingQualification =
      careerCourseTeacherForStudent.pendingToQualification.find(
        (x) =>
          x.course.idCourse == idCourse && x.teacher.idTeacher == idTeacher,
      );
    careerCourseTeacherForStudent.pendingToQualification =
      careerCourseTeacherForStudent.pendingToQualification.filter(
        (elemento) => elemento._id != deletePendingQualification._id,
      );

    this.logger.debug(
      `::pendingToQualification::after::${careerCourseTeacherForStudent.pendingToQualification.length}`,
    );

    await careerCourseTeacherForStudent.save();

    return <response.ResponseGenericDto>{
      message: 'Processo exitoso',
      operation: `::${FnQualificationIgnorantService.name}::execute`,
      data: {
        isRemoveTeacherToList: true,
      },
    };
  }
}
