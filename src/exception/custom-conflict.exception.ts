import { ConflictException } from '@nestjs/common';

export class NotExistStudentCareerCourseTeacherCustomException extends ConflictException {
  constructor() {
    super(`No existe un estudiante con la lista de califacion de profesores`);
  }
}