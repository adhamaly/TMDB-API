import { InternalServerErrorException } from '@nestjs/common';
import { Validator } from 'class-validator';
import { Document } from 'mongoose';
import { plainToInstance } from 'class-transformer';

type ClassType = new (...args: any[]) => any;

export async function validateSchema(
  doc: Document,
  validationClass: ClassType,
) {
  // For class-transformer
  const instance = plainToInstance(validationClass, doc.toObject(), {
    enableImplicitConversion: true,
  });

  const validator = new Validator();
  const validationErrors = await validator.validate(instance, {
    skipMissingProperties: true,
  });

  if (validationErrors.length > 0) {
    throw new InternalServerErrorException('Model Validation Error');
  }
}
