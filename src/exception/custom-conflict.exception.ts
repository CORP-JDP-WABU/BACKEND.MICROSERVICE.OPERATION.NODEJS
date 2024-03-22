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

export class NotExistsTeacherCustomException extends ConflictException {
  constructor(customCode: string) {
    super(`No existe un profesor con dichos parametros [${customCode}`);
  }
}

export class UnahutorizedUniversityCustomException extends ConflictException {
  constructor(customCode: string) {
    super(`Usted no esta authorizado para realizar consultas en esta universidad [${customCode}`);
  }
}
