import { FactoryProvider, Module } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { ModelNames } from 'src/lib/enums';
import { userSchemaFactory } from 'src/lib/mongo';

const UserMongooseDynamicModule: FactoryProvider = {
  provide: ModelNames.USER,
  inject: [getConnectionToken()],
  useFactory: userSchemaFactory,
};

const userProviders = [UserMongooseDynamicModule];

@Module({
  imports: [],
  providers: userProviders,
  exports: userProviders,
})
export class UserMongooseModule {}
