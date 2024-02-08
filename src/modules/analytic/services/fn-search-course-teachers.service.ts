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

        const analitycSearch = await this.analitycSearchCourseTeacherModel.findOne({
            idUniversity, idCareer, idStudent
        });
        
        if(!analitycSearch) {
            await this.create(idUniversity, idCareer, idStudent);
        }
        else {
            await this.update(analitycSearch.id)
        }

        return null;
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

    private async create(idUniversity: mongoose.Types.ObjectId, idCareer: mongoose.Types.ObjectId, idStudent: mongoose.Types.ObjectId) {
        const create = await this.analitycSearchCourseTeacherModel.create({
            idUniversity,
            idCareer,
            idStudent,
            numberOfRepetitions: 1,
            module: 'ANALITYC_SEARCH_COURSE_TEACHER',
            parameters: null,
            auditProperties: this.generateAuditProperties()
        });

        this.logger.debug(`::execute::create::${create.id}`);
    }

    private async update(idAnalityc: mongoose.Types.ObjectId) {
        const update = await this.analitycSearchCourseTeacherModel.findByIdAndUpdate(idAnalityc, {
            $set: {
                "auditProperties.dateUpdate": new Date(),
                "auditProperties.userUpdate":  `${FnSearchCourseTeachersService.name}`,
                 status: {
                    code: 2,
                    description: '::update::search::course::teacher::'
                }
            },
            $inc: {
                numberOfRepetitions: 1
            }
        })

        this.logger.debug(`::execute::update::${update.id}`);
    }
}