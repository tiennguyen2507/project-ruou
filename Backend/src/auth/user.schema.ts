import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'auth_users' })
export class AuthUser {
  @Prop({ required: true }) site: string;
  @Prop({ required: true }) email: string;
  @Prop({ required: true, select: false }) passwordHash: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) phone: string;
  @Prop({ required: true }) address: string;
}
export type AuthUserDocument = HydratedDocument<AuthUser>;
export const AuthUserSchema = SchemaFactory.createForClass(AuthUser);
AuthUserSchema.index({ site: 1, email: 1 }, { unique: true });
