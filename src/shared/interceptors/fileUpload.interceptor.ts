import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Param,
  HttpStatus,
  Header,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { map } from 'rxjs/operators';
import multer = require('multer');
import { plainToClass } from 'class-transformer';
import { ProfileDto } from '../../user/dtos/profile.dto';
import { validate } from 'class-validator';

// const sharp = require('sharp');
@Injectable()
export class uploadInterceptor implements NestInterceptor {
  constructor(private params) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    if (req?.headers['content-type']?.includes('multipart/form-data')) {
      const postMulterRequest: any = await new Promise((resolve, reject) => {
        const multerReponse = multer({
          storage: diskStorage({
            destination: (req, file, cb) => {
              fs.mkdir('./public/media', { recursive: true }, (err) => {
                if (err) {
                  return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: err.message,
                    data: null,
                  };
                }
                cb(null, './public/media');
              });
            },
            filename: (req, file, cb) => {
              let name = file.originalname.split('.');
              cb(
                null,
                name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() +
                  '-' +
                  Date.now() +
                  '.' +
                  name[name.length - 1],
              );
            },
          }),
        }).fields(this.params);
        multerReponse(req, res, (err) => {
          if (err) reject(err);
          resolve(req);
        });
      });

      return next.handle();
      // return next.handle().pipe(
      //   map(async (data) => {
      //     try {
      //       for (let i = 0; i < Object.keys(req.files)?.length; i++) {
      //         const filepath =
      //           Object.keys(req.files).length > 0
      //             ? req.files[Object.keys(req.files)[i]][0].path
      //             : '';
      //         if (filepath && fs.existsSync(filepath)) {
      //           fs.unlink(filepath, async (err) => {
      //             if (err) {
      //               res.send(err);
      //             }
      //           });
      //         }
      //       }
      //     } catch (error) {
      //       return {
      //         statusCode: HttpStatus.BAD_REQUEST,
      //         message: error.message,
      //         data: null,
      //       };
      //     }
      //     return data;
      //   }),
      // );
    } else {
      return next.handle();
    }
  }
}
