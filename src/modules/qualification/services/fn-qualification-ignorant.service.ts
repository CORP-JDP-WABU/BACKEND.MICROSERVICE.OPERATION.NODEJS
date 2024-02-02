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
      throw new exceptions.NotExistStudentCareerCourseTeacherCustomException();
    }

    careerCourseTeacherForStudent.pendingToQualification =
      careerCourseTeacherForStudent.pendingToQualification.filter(
        (elemento) =>
          elemento.course.idCourse !== idCourse &&
          elemento.teacher.idTeacher !== idTeacher,
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
