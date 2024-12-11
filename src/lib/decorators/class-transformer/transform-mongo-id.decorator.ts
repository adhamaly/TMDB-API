import { BadRequestException } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { Types } from 'mongoose';

const isObjectId = (id: string | Types.ObjectId) =>
  new RegExp('^[0-9a-fA-F]{24}$').test(id?.toString() ?? '');

export function TransformObjectId() {
  return Transform(({ obj, key }: TransformFnParams) => {
    if (!isObjectId(obj[key])) {
      throw new BadRequestException('Invalid ObjectId');
    }

    return new Types.ObjectId(obj[key]);
  });
}

export function TransformObjectIds() {
  return Transform(({ obj, key }: TransformFnParams) => {
    if (!Array.isArray(obj[key])) {
      throw new BadRequestException('Invalid ObjectIds array');
    }

    return (obj[key] as Array<Types.ObjectId | string>).map((id) => {
      if (!isObjectId(id)) {
        throw new BadRequestException('Invalid ObjectId');
      }

      return new Types.ObjectId(id);
    });
  });
}
