import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Model } from 'mongoose';
import { BaseModel, IBaseInstanceMethods } from '../base';

export class User extends BaseModel<User> {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export interface IUserInstanceMethods extends IBaseInstanceMethods {
  comparePassword(password: string): Promise<boolean>;
}
export interface IUserModel
  extends Model<User, Record<string, unknown>, IUserInstanceMethods> {}
