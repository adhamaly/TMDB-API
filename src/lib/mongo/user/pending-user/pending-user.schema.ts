import * as bcrypt from 'bcrypt';
import { Connection, Schema } from 'mongoose';
import {
  IPendingUserInstanceMethods,
  IPendingUserModel,
  PendingUser,
} from './pending-user.type';
import { validateSchema } from 'src/lib/helpers';
import { ModelNames } from 'src/lib/enums';

const PendingUserSchema = new Schema<
  PendingUser,
  IPendingUserModel,
  IPendingUserInstanceMethods
>(
  {
    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export function pendingUserSchemaFactory(connection: Connection) {
  PendingUserSchema.index({ email: 1 });
  PendingUserSchema.index({ username: 1 });

  PendingUserSchema.pre('validate', async function () {
    await validateSchema(this, PendingUser);
  });

  PendingUserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
      return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });

  PendingUserSchema.pre('save', async function () {
    this.email = this.email.toLowerCase();
    this.username = this.username.toLowerCase();
  });

  const pendingUserModel = connection.model(
    ModelNames.PENDING_USER,
    PendingUserSchema,
  );

  return pendingUserModel;
}
