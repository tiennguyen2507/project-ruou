import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProxyHistoryDocument = ProxyHistory & Document;

@Schema({ timestamps: true, collection: 'proxy_history' })
export class ProxyHistory {
  @Prop({ required: true, index: true })
  id: string;

  @Prop({ required: true })
  targetUrl: string;

  @Prop({ required: true })
  finalUrl: string;

  @Prop({ default: '' })
  ip: string;

  @Prop({ default: '' })
  location: string;

  @Prop({ default: 200 })
  status: number;

  @Prop({ default: '' })
  device: string;

  @Prop({ default: 'direct' })
  redirectType: string;

  @Prop({ default: () => new Date().toISOString() })
  timestamp: string;

  @Prop({ default: true })
  success: boolean;

  @Prop({ default: '' })
  affSid?: string;

  // TTL index: tự động xóa bản ghi sau 3 ngày (259,200 giây)
  @Prop({ default: Date.now })
  createdAt?: Date;
}

export const ProxyHistorySchema = SchemaFactory.createForClass(ProxyHistory);
ProxyHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 3 * 24 * 3600 });
