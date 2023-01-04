import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>;

@Schema()
export class Device {
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  ip: string;
  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: String, required: true })
  lastActiveDate: string;
  @Prop({ type: String, required: true })
  expiredDate: string;
  @Prop({ type: String, required: true })
  deviceId: string;
}
export const DeviceSchema = SchemaFactory.createForClass(Device);
