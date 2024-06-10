import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T> {
  statusCode: HttpStatus;
  message: string;
  data: any;
}
