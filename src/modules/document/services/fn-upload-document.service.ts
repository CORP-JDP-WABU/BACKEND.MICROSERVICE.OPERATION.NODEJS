import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as AWS from 'aws-sdk';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as schemas from 'src/common/schemas';
import * as exceptions from 'src/exception';
import * as response from 'src/common/dto';
import * as enums from 'src/common/enum';
import { DOCUMENT_TYPE_SPANISH } from 'src/common/const/comon.const';

@Injectable()
export class FnUploadDocumentService {
  private logger = new Logger(FnUploadDocumentService.name);
  private bucket = `wabu-development`;
  private s3Route = `university/UNIVERSITYNAME/course/COURSENAME/document/DOCUMENTTYPE`;

  constructor(
    @Inject('AWS_S3') private readonly awsS3: AWS.S3,
    @InjectModel(schemas.Universities.name)
    private readonly universityModel: mongoose.Model<schemas.UniversitiesDocument>,
    @InjectModel(schemas.UniversityCourse.name)
    private readonly universityCourseModel: mongoose.Model<schemas.UniversityCourseDocument>,
    @InjectModel(schemas.UniversityTeacher.name)
    private readonly universityTeacherModel: mongoose.Model<schemas.UniversityTeacherDocument>,
    @InjectModel(schemas.UniversityCourseDoc.name)
    private readonly universityCourseDocModel: mongoose.Model<schemas.UniversityCourseDocDocument>,
    @InjectModel(schemas.ProfileCourse.name)
    private readonly profileCourseModel: mongoose.Model<schemas.ProfileCourseDocument>,
    @InjectModel(schemas.Students.name)
    private readonly studentModel: mongoose.Model<schemas.StudentsDocument>
  ) {}

  /**
   * Ejecuta el proceso de carga de un documento.
   *
   * @param {string} idUniversity - El ID de la universidad a la que pertenece el documento.
   * @param {string} idCourse - El ID del curso al que pertenece el documento.
   * @param {string} idTeacher - El ID del profesor asociado al documento (opcional).
   * @param {Express.Multer.File} file - El archivo del documento a subir.
   * @param {string} documentType - El tipo de documento.
   * @param {string} cicleName - El nombre del ciclo al que pertenece el documento.
   * @returns {Promise<response.ResponseGenericDto>} - Una promesa que se resuelve con un objeto de respuesta que contiene información sobre el proceso de carga del documento.
   */
  async execute(
    idUniversity: string,
    idCourse: string,
    idTeacher: string,
    files: Express.Multer.File[],
    documentType: string,
    cicleName: string,
    userDecorator: any,
  ) {
    
    const idDocuemnts = []
    const { idStudent } = userDecorator;

    const [universityPromise, universityCoursePromise, studentPromise] = await Promise.all([
      this.universityModel.findById(idUniversity, { name: 1 }),
      this.universityCourseModel.findById(idCourse, { name: 1 }),
      this.studentModel.findById(idStudent, { firstName: 1, lastName: 1 })
    ]);

    const teacher = await this.getTeacher(idTeacher);

    const { name: universityName } = universityPromise;
    const { name: courseName } = universityCoursePromise;

    const key = this.generateS3RouteForUpload(universityName, courseName, documentType);

    let documents : any [] = [];
    let personalizedKeys: string [] = [];
    
    for (const file of files) {
      const idDocument = mongoose.Types.ObjectId();
      const extension = path.extname(file.originalname);

      const personalizedKey = `${key}/${this.normalizeText(
        cicleName
      )}|${idDocument.toString()}${extension}`;

      const uploadDocument = await this.uploadDocument(personalizedKey, file);

      documents.push({
        _id: idDocument,
        searchName: this.normalizeText(file.originalname),
        originalName: file.originalname,
        documentType,
        extension,
        url: uploadDocument.Location,
        student: {
          idStudent: studentPromise._id,
          fullName: `${studentPromise.firstName} ${studentPromise.lastName}`
        }
      });

      personalizedKeys.push(personalizedKey);

      idDocuemnts.push(idDocument.toString());
    }

    await this.insertDocument(
      idUniversity,
      idCourse,
      courseName,
      cicleName,
      teacher,
      documents,
      personalizedKeys
    );

    this.updateDocumentProfileCourse(mongoose.Types.ObjectId(idCourse));

    return <response.ResponseGenericDto>{
      message: 'Processo exitoso',
      operation: `::${FnUploadDocumentService.name}::execute`,
      data: {
        idDocuemnts,
        isCreate: true
      }
    };
  }

  /**
   * Genera la ruta en S3 para cargar el documento.
   *
   * @param {string} universityName - El nombre de la universidad.
   * @param {string} courseName - El nombre del curso.
   * @param {string} documentType - El tipo de documento.
   * @returns {string} - La ruta generada en S3.
   * @throws {exceptions.GenerateS3RouterException} Si ocurre un error al generar la ruta en S3.
   */
  private generateS3RouteForUpload(
    universityName: string,
    courseName: string,
    documentType: string
  ) {
    try {
      const normalizeUniversityName = this.normalizeText(universityName);
      const normalizeCourseName = this.normalizeText(courseName);
      const documentTypeSpanish = DOCUMENT_TYPE_SPANISH[documentType];
      return this.s3Route
        .replace('UNIVERSITYNAME', normalizeUniversityName)
        .replace('COURSENAME', normalizeCourseName)
        .replace('DOCUMENTTYPE', documentTypeSpanish);
    } catch (error) {
      this.logger.error(`::generateS3RouteForUpload::error`, error);
      throw new exceptions.GenerateS3RouterException();
    }
  }

  /**
   * Sube un documento a AWS S3.
   *
   * @param {string} key - La clave bajo la cual se almacenará el documento en S3.
   * @param {Express.Multer.File} file - El archivo del documento a subir.
   * @returns {Promise<AWS.S3.ManagedUpload.SendData>} - Una promesa que se resuelve con los datos de la carga.
   * @throws {exceptions.UploadDocumentS3Exception} Si ocurre un error al subir el documento a S3.
   */
  private async uploadDocument(
    key: string,
    file: Express.Multer.File
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      };

      return await this.awsS3.upload(params).promise();
    } catch (error) {
      this.logger.error(`::uploadDocument::error`, error);
      throw new exceptions.UploadDocumentS3Exception();
    }
  }

  /**
   * Obtiene un profesor por su ID.
   *
   * @param {string} idTeacher - El ID del profesor.
   * @returns {schemas.UniversityTeacher | null} - El profesor encontrado o null si no se encontró ningún profesor.
   * @throws {exceptions.NotExistsTeacherCustomException} Si el ID del profesor no es válido o no se encuentra el profesor.
   */
  private async getTeacher(idTeacher: string) {
    let teacher: schemas.UniversityTeacher = null;
    if (idTeacher != undefined) {
      if (!mongoose.isValidObjectId(idTeacher)) {
        throw new exceptions.NotExistsTeacherCustomException('UPLOAD_DOCUMENT_INVALID_TEACHER');
      }
      teacher = await this.universityTeacherModel.findById(idTeacher);
      if (!teacher) {
        throw new exceptions.NotExistsTeacherCustomException('UPLOAD_DOCUMENT_TEACHER_NOTFOUND');
      }
    }
    return teacher;
  }

  /**
   * Inserta un documento en la base de datos.
   *
   * @param {string} idUniversity - El ID de la universidad.
   * @param {string} idCourse - El ID del curso.
   * @param {string} courseName - El nombre del curso.
   * @param {string} cicleName - El nombre del ciclo.
   * @param {schemas.UniversityTeacher} teacher - El profesor relacionado con el documento.
   * @param {any[]} document - Los documentos a insertar.
   * @param {string[]} personalizedKey - Las claves personalizadas de los documentos en AWS S3.
   * @returns {Promise<void>} - Una promesa vacía.
   * @throws {exceptions.InserDocumentException} Si ocurre un error al insertar el documento en la base de datos.
   */
  private async insertDocument(
    idUniversity: string,
    idCourse: string,
    courseName: string,
    cicleName: string,
    teacher: schemas.UniversityTeacher,
    documents: any[],
    personalizedKeys: string[]
  ) {
    try {
      await this.universityCourseDocModel.create({
        idUniversity: mongoose.Types.ObjectId(idUniversity),
        course: {
          idCourse: mongoose.Types.ObjectId(idCourse),
          name: courseName,
          searchText: this.normalizeText(courseName)
        },
        cicleName: cicleName,
        teachers: teacher == null ? [] : [teacher.searchText],
        documents,
        auditProperties: {
          status: {
            code: 1,
            description: 'REGISTER'
          },
          dateCreate: new Date(),
          dateUpdate: null,
          userCreate: 'STUDENT',
          userUpdate: null,
          recordActive: true
        }
      });
    } catch (error) {
      const params: AWS.S3.DeleteObjectsRequest = {
        Bucket: this.bucket,
        Delete: { Objects: personalizedKeys.map(Key => ({ Key })) }
      };
      await this.awsS3.deleteObjects(params).promise();
      this.logger.error(`::insert-document::error`, error);
      throw new exceptions.InserDocumentException();
    }
  }

  private async updateDocumentProfileCourse(idCourse: mongoose.Types.ObjectId) {
    try {
      this.logger.debug(`::start::updateDocumentProfileCourse::${idCourse}`);  
      const [
        universityCourseDocs,
        profileCourse  
      ] = await Promise.all(
        [
          this.universityCourseDocModel.find({ "course.idCourse": idCourse }),
          this.profileCourseModel.findById(idCourse)
        ]
      )

      if(profileCourse) {

        let allDocuments = [];
        for (const universityCourseDoc of universityCourseDocs) {
          allDocuments.push(universityCourseDoc.document)
        }

        const countDocuments : any = this.countDocumentsByType(allDocuments);
        profileCourse.documents = countDocuments;
        profileCourse.save();
        
        this.logger.debug(`::updateDocumentProfileCourse::documents::${JSON.stringify(countDocuments)}`); 
      }
      
      this.logger.debug(`::end::updateDocumentProfileCourse::${idCourse}`)
    
    } catch (error) {
      this.logger.error(`::updateDocumentProfileCourse::error`, error);
      throw new exceptions.UpdateProfileCourseException(); 
    }
    
  }

  private countDocumentsByType(documents: any[]) {
    const expectedTypes : string[] = Object.values(enums.DocumentTypeEnum).filter(
      value => typeof value === 'string'
    );
    const countsMap = new Map<string, number>();
    expectedTypes.forEach(type => countsMap.set(type, 0));

    documents.forEach(document => {
      const { documentType } = document;
      if (countsMap.has(documentType)) {
        countsMap.set(documentType, countsMap.get(documentType)! + 1);
      } else {
        countsMap.set(documentType, 1);
      }
    });

    const result: { [key: string]: number } = {};
    countsMap.forEach((count, documentType) => {
      result[documentType.toLowerCase()] = count;
    });
  
    return result;
  }

  /**
   * Normaliza un texto eliminando caracteres especiales y convirtiéndolo a minúsculas.
   *
   * @param {string} text - El texto que se va a normalizar.
   * @returns {string} - El texto normalizado sin caracteres especiales y en minúsculas.
   */
  private normalizeText(text: string): string {
    text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    text = text.replace(/[^\w\s]/gi, '').replace(/\s+/g, '');
    return text.toLowerCase();
  }
}
