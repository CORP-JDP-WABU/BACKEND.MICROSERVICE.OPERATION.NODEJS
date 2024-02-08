import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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

    const analitycSearch =
      await this.analitycSearchQualificationTeacherModel.findOne({
        idUniversity,
        idCareer,
        idStudent,
      });

    if (!analitycSearch) {
      await this.create(idUniversity, idCareer, idStudent);
    } else {
      await this.update(analitycSearch.id);
    }

    return null;
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
        description: '::register::search::qualification::teacher::',
      },
    };
  }

  private async create(
    idUniversity: mongoose.Types.ObjectId,
    idCareer: mongoose.Types.ObjectId,
    idStudent: mongoose.Types.ObjectId,
  ) {
    const create = await this.analitycSearchQualificationTeacherModel.create({
      idUniversity,
      idCareer,
      idStudent,
      numberOfRepetitions: 1,
      module: 'ANALITYC_SEARCH_QUALIFICATION_TEACHER',
      parameters: null,
      auditProperties: this.generateAuditProperties(),
    });

    this.logger.debug(`::execute::create::${create.id}`);
  }

  private async update(idAnalityc: mongoose.Types.ObjectId) {
    const update =
      await this.analitycSearchQualificationTeacherModel.findByIdAndUpdate(
        idAnalityc,
        {
          $set: {
            'auditProperties.dateUpdate': new Date(),
            'auditProperties.userUpdate': `${FnSearchQualificationTeachersService.name}`,
            'status.code': 2,
            'status.description': '::update::search::qualification::teacher::'
          },
          $inc: {
            numberOfRepetitions: 1,
          },
        },
      );

    this.logger.debug(`::execute::update::${update.id}`);
  }
}
