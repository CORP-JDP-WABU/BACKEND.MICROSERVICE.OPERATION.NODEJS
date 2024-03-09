import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import * as schemas from 'src/common/schemas';
import * as response from 'src/common/dto';
import * as exception from 'src/exception';

@Injectable()
export class FnCommentService {
  private logger = new Logger(FnCommentService.name);

  constructor(
    @InjectModel(schemas.Students.name)
    private readonly studentModel: mongoose.Model<schemas.StudentsDocument>,
    @InjectModel(schemas.TeacherCourseComments.name)
    private readonly teacherCourseCommentModel: mongoose.Model<schemas.TeacherCourseCommentsDocument>,
    @InjectModel(schemas.CareerCourseTeacher.name)
    private readonly careerCourseTeacherModel: mongoose.Model<schemas.CareerCourseTeacherDocument>,
    @InjectModel(schemas.UniversityTeacher.name)
    private readonly universityTeacherModel: mongoose.Model<schemas.UniversityTeacherDocument>,
  ) {}

  async execute(
    idCourse: string,
    idTeacher: string,
    userDecorator: any,
    comment: string,
  ) {
    const { idStudent } = userDecorator;

    this.logger.debug(
      `::execute::parameters::${idCourse}-${idTeacher}-${idStudent}-${comment}`,
    );

    const teacherCourseComment = await this.teacherCourseCommentModel.findOne({
      idCourse: mongoose.Types.ObjectId(idCourse),
      idTeacher: mongoose.Types.ObjectId(idTeacher),
    });

    const student = await this.studentModel.findById(idStudent, {
      _id: 1,
      firstName: 1,
      lastName: 1,
      university: 1,
      profileUrln: 1,
    });

    if (!student) {
      throw new exception.NotExistStudentCustomException(
        `COMMENT_NOT_EXIST_STUDENT`,
      );
    }

    await this.updateHasCommenInQualification(idStudent, idCourse, idTeacher);

    if (!teacherCourseComment) {
      return this.createCommentInCourseTeacher(
        student,
        idTeacher,
        idCourse,
        comment,
      );
    }

    const studentComment = await this.generateStudentComments(student, comment);
    teacherCourseComment.students.push(studentComment);
    await teacherCourseComment.save();
    this.updateTeacherCourseCommentIncrement(idTeacher, idCourse);
    return this.heandleReturn(false);
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // ¡Recuerda que los meses en JavaScript son 0-indexados!
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  private async generateStudentComments(student: any, comment: string) {
    return {
      _id: student._id,
      fullName: `${student.firstName} ${student.lastName}`,
      profileUrl: student.profileUrl,
      comment,
      createdAt: new Date(),
      createdAtString: this.formatDate(new Date()),
      likes: [],
      dislikes: [],
    };
  }

  private async createCommentInCourseTeacher(
    student: any,
    idTeacher: string,
    idCourse: string,
    comment: string,
  ) {
    const newTeacherCourseComment = {
      idUniversity: student.university._id,
      idTeacher: mongoose.Types.ObjectId(idTeacher),
      idCourse: mongoose.Types.ObjectId(idCourse),
      students: [
        {
          _id: student._id,
          fullName: `${student.firstName} ${student.lastName}`,
          comment,
          profileUrl: student.profileUrl,
          createdAt: new Date(),
          createdAtString: this.formatDate(new Date()),
          likes: [],
          dislikes: [],
        },
      ],
    };

    await this.teacherCourseCommentModel.create(newTeacherCourseComment);

    return this.heandleReturn(true);
  }

  private async updateHasCommenInQualification(
    idStudent: string,
    idCourse: string,
    idTeacher: string,
  ) {
    const careerCourseTeacherForStudent =
      await this.careerCourseTeacherModel.findOne({
        idStudent: new mongoose.Types.ObjectId(idStudent),
        'pendingToQualification.course.idCourse': idCourse,
        'pendingToQualification.teacher.idTeacher': idTeacher,
      });

    if (careerCourseTeacherForStudent) {
      /*throw new exception.NotExistStudentCareerCourseTeacherCustomException(
        `QUALIFICATION_NOT_EXISTS_STUDENT`,
      );*/
      const hasCommentUpdate =
        careerCourseTeacherForStudent.pendingToQualification.find(
          (elemento) =>
            elemento.course.idCourse == idCourse &&
            elemento.teacher.idTeacher == idTeacher,
        );

      hasCommentUpdate.hasComment = true;

      careerCourseTeacherForStudent.pendingToQualification =
        careerCourseTeacherForStudent.pendingToQualification.filter(
          (elemento) => elemento._id != hasCommentUpdate._id,
        );

      this.logger.debug(
        `::pendingToQualification::after::${careerCourseTeacherForStudent.pendingToQualification.length}`,
      );

      await careerCourseTeacherForStudent.save();
    }
  }

  private async updateTeacherCourseCommentIncrement(
    idTeacher: string,
    idCourse: string,
  ) {
    await this.universityTeacherModel.bulkWrite([
      {
        updateOne: {
          filter: {
            _id: new mongoose.Types.ObjectId(idTeacher),
            'courses._id': new mongoose.Types.ObjectId(idCourse),
          },
          update: {
            $inc: {
              'courses.$[course].manyComments': 1,
            },
          },
          arrayFilters: [
            { 'course._id': new mongoose.Types.ObjectId(idCourse) },
          ],
        },
      },
    ]);
  }

  private heandleReturn(isCommentCreate: boolean) {
    return <response.ResponseGenericDto>{
      message: 'Processo exitoso',
      operation: `::${FnCommentService.name}::execute`,
      data: {
        isCommentCreate,
      },
    };
  }
}
