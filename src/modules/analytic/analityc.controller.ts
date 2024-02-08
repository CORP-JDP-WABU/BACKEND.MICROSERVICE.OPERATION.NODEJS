import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AllExceptionsFilter } from 'src/exception';
import * as services from './services';
import * as interfaces from './interfaces';

@Controller()
export class AnalitycController {
  constructor(
    private readonly fnSerchCourseTeacherService: services.FnSearchCourseTeachersService,
    private readonly fnSearchQualificationTeacherService: services.FnSearchQualificationTeachersService,
  ) {}

  @UseFilters(new AllExceptionsFilter())
  @MessagePattern({
    subjet: 'client-operation',
    function: 'search-course-teacher',
  })
  searchCourseTeacher(request: interfaces.IGlobalAnalityc) {
    return this.fnSerchCourseTeacherService.execute(request);
  }

  @MessagePattern({
    subjet: 'client-operation',
    function: 'search-qualification-teacher',
  })
  searchQualificationTeacher(request: interfaces.IGlobalAnalityc) {
    return this.fnSearchQualificationTeacherService.execute(request);
  }
}
