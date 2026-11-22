import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProxyAutoConfigDocument = ProxyAutoConfig & Document;

@Schema({ timestamps: true, collection: 'proxy_auto_config' })
export class ProxyAutoConfig {
  @Prop({ required: true, unique: true, default: 'default' })
  key: string;

  @Prop({ default: false })
  isRunning: boolean;

  @Prop({ default: 60 })
  minDelaySec: number;

  @Prop({ default: 180 })
  maxDelaySec: number;

  @Prop({ default: 0 })
  totalRuns: number;

  @Prop({ default: 0 })
  currentTaskIndex: number;

  @Prop({ default: '' })
  defaultProxy?: string;
}

export const ProxyAutoConfigSchema = SchemaFactory.createForClass(ProxyAutoConfig);
