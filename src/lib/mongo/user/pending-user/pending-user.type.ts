import { PickType } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { User } from '../user.type';
import { IsNotEmpty, IsString } from 'class-validator';
import { IBaseInstanceMethods } from '../../base';

export class PendingUser extends PickType(User, [
  'email',
  'password',
] as const) {
  constructor(pendingUser: PendingUser) {
    super(pendingUser);
    Object.assign(this, pendingUser);
  }

  @IsString()
  @IsNotEmpty()
  username: string;
}

export interface IPendingUserInstanceMethods extends IBaseInstanceMethods {}
export interface IPendingUserModel
  extends Model<
    PendingUser,
    Record<string, unknown>,
    IPendingUserInstanceMethods
  > {}
