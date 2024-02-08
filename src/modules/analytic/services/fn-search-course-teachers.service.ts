import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';
import * as schemas from 'src/common/schemas';
import * as interfaces from '../interfaces';

@Injectable()
export class FnSearchCourseTeachersService { 

    private logger = new Logger(FnSearchCourseTeachersService.name);

    constructor(
        @InjectModel(schemas.AnalitycSearchCourseTeachers.name)
        private readonly analitycSearchCourseTeacherModel: mongoose.Model<schemas.AnalitycSearchCourseTeachersDocument>,
    ) {}

    async execute(request: interfaces.IGlobalAnalityc) {
        const idUniversity = mongoose.Types.ObjectId(request.idUniversity);
        const idCareer = mongoose.Types.ObjectId(request.idCareer);
        const idStudent = mongoose.Types.ObjectId(request.idStudent);

        const register = await this.analitycSearchCourseTeacherModel.create({
            idUniversity,
            idCareer,
            idStudent,
            module: 'ANALITYC_SEARCH_COURSE_TEACHER',
            parameters: null,
            auditProperties: this.generateAuditProperties()
        });

        this.logger.debug(`::execute::register::${register.id}`);
    }

    private generateAuditProperties() {
        return {
            dateCreate: new Date(),
            dateUpdate: null,
            userCreate: `${FnSearchCourseTeachersService.name}`,
            userUpdate: null,
            recordActive: true,
            status: {
                code: 1,
                description: '::register::search::course::teacher::'
            }
        }
    }
}