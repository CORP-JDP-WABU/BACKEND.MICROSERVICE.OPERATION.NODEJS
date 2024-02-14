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
      
    const hasIgnorantUpdate =
      careerCourseTeacherForStudent.pendingToQualification.find(
        (elemento) =>
          elemento.course.idCourse == idCourse &&
          elemento.teacher.idTeacher == idTeacher,
      );
    
    const manyQualification = careerCourseTeacherForStudent.manyQualification;
    const manyIgnor = careerCourseTeacherForStudent.pendingToQualification.filter(x => x.hasIgnor).length;

    if(manyQualification == (manyIgnor + 1)) {
      await this.careerCourseTeacherModel.updateMany({ _id: careerCourseTeacherForStudent._id }, {
        $set: { "pendingToQualification.$[].hasIgnor": false },
        multi: true
      });
      return <response.ResponseGenericDto>{
        message: 'Processo exitoso',
        operation: `::${FnQualificationIgnorantService.name}::execute`,
        data: {
          isRemoveTeacherToList: false
        },
      };
    }

    hasIgnorantUpdate.hasIgnor = true;
    hasIgnorantUpdate.hasQualification = true;

    careerCourseTeacherForStudent.pendingToQualification =
      careerCourseTeacherForStudent.pendingToQualification.filter(
        (elemento) => elemento._id != hasIgnorantUpdate._id,
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
