import { ConflictException } from '@nestjs/common';

export class NotExistStudentCareerCourseTeacherCustomException extends ConflictException {
  constructor(customCode: string) {
    super(`No existe un estudiante con la lista de califacion de profesores [${customCode}`);
  }
}

export class NotExistStudentCustomException extends ConflictException {
  constructor(customCode: string) {
    super(`No existe un estudiante con dichos parametros [${customCode}`);
  }
}
