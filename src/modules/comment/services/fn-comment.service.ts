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
  ) {}

  async execute(
    idCourse: string,
    idTeacher: string,
    userDecorator: any,
    comment: string,
  ) {
    const { idStudent } = userDecorator;

    const teacherCourseComment = await this.teacherCourseCommentModel.findOne({
      idCourse: mongoose.Types.ObjectId(idCourse),
      idTeacher: mongoose.Types.ObjectId(idTeacher),
    });

    const student = await this.studentModel.findById(idStudent, {
      _id: 1,
      firstName: 1,
      lastName: 1,
      university: 1,
    });

    if (!student) {
      throw new exception.NotExistStudentCustomException(
        `COMMENT_NOT_EXIST_STUDENT`,
      );
    }

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
    return this.heandleReturn(false);
  }

  private async generateStudentComments(student: any, comment: string) {
    return {
      _id: student._id,
      fullName: `${student.firstName} ${student.lastName}`,
      comment,
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
          likes: [],
          dislikes: [],
        },
      ],
    };

    await this.teacherCourseCommentModel.create(newTeacherCourseComment);

    return this.heandleReturn(true);
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
