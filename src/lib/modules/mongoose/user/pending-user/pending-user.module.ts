import { FactoryProvider, Module } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { ModelNames } from 'src/lib/enums';
import { pendingUserSchemaFactory } from 'src/lib/mongo';

const PendingUserMongooseDynamicModule: FactoryProvider = {
  provide: ModelNames.PENDING_USER,
  inject: [getConnectionToken()],
  useFactory: pendingUserSchemaFactory,
};

const pendingUserProviders = [PendingUserMongooseDynamicModule];

@Module({
  imports: [],
  providers: pendingUserProviders,
  exports: pendingUserProviders,
})
export class PendingUserMongooseModule {}
