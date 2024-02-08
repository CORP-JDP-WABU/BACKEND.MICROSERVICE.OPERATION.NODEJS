import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';
import * as schemas from 'src/common/schemas';
import * as interfaces from '../interfaces';

@Injectable()
export class FnSearchQualificationTeachersService { 

    private logger = new Logger(FnSearchQualificationTeachersService.name);

    constructor(
        @InjectModel(schemas.AnalitycSearchQualificationTeachers.name)
        private readonly analitycSearchQualificationTeacherModel: mongoose.Model<schemas.AnalitycSearchQualificationTeachers>,
    ) {}

    async execute(request: interfaces.IGlobalAnalityc) {
        const idUniversity = mongoose.Types.ObjectId(request.idUniversity);
        const idCareer = mongoose.Types.ObjectId(request.idCareer);
        const idStudent = mongoose.Types.ObjectId(request.idStudent);

        const register = await this.analitycSearchQualificationTeacherModel.create({
            idUniversity,
            idCareer,
            idStudent,
            module: 'ANALITYC_SEARCH_QUALIFICATION_TEACHER',
            parameters: null,
            auditProperties: this.generateAuditProperties()
        });

        this.logger.debug(`::execute::register::${register.id}`);
    }

    private generateAuditProperties() {
        return {
            dateCreate: new Date(),
            dateUpdate: null,
            userCreate: `${FnSearchQualificationTeachersService.name}`,
            userUpdate: null,
            recordActive: true,
            status: {
                code: 1,
                description: '::register::search::qualification::teacher::'
            }
        }
    }
}