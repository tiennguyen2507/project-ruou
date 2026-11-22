import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProxyAutoTaskDocument = ProxyAutoTask & Document;

@Schema({ timestamps: true, collection: 'proxy_auto_tasks' })
export class ProxyAutoTask {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true })
  targetUrl: string;

  @Prop({ default: '' })
  proxyUrl: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: 0 })
  totalRuns: number;

  @Prop({ default: null })
  lastRun?: string;

  @Prop({ default: null })
  lastStatus?: number;

  @Prop({ default: null })
  lastSuccess?: boolean;

  @Prop({ default: null })
  lastIp?: string;

  @Prop({ default: null })
  lastDevice?: string;

  @Prop({ default: null })
  lastFinalUrl?: string;
}

export const ProxyAutoTaskSchema = SchemaFactory.createForClass(ProxyAutoTask);
