import { IsBoolean, IsDate, IsOptional } from 'class-validator';

export class BaseModel<T = any> {
  constructor(data: T) {
    Object.assign(this, data);
  }

  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @IsOptional()
  @IsBoolean()
  wasNew?: boolean;

  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}

export interface IBaseInstanceMethods {
  deleteDoc: () => Promise<void>;
}
