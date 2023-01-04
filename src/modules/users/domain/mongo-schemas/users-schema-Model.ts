import { HydratedDocument } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
class AccountData {
  @Prop({ type: String, required: true, minlength: 3, maxlength: 10 })
  login: string;
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: String, required: true })
  passwordHash: string;
  @Prop({ type: String, required: true })
  createdAt: string;
}

//const AccountDataSchema = SchemaFactory.createForClass(AccountData);
@Schema()
class EmailConfirmation {
  @Prop({ type: String, required: true })
  confirmationCode: string;
  @Prop()
  expirationDate: Date;
  @Prop({ type: Boolean, default: false })
  isConfirmation: boolean;
}

//const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);
@Schema()
class EmailRecovery {
  @Prop({ type: String, required: true })
  recoveryCode: string;
  @Prop()
  expirationDate: Date;
  @Prop({ type: Boolean, default: false })
  isConfirmation: boolean;
}

//const EmailRecoverySchema = SchemaFactory.createForClass(EmailRecovery);

export class UserBanInfo {
  @Prop({ type: Boolean, default: false })
  isBanned: boolean;
  @Prop({ type: String })
  banDate: string;
  @Prop({ type: String })
  banReason: string;
}


export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  accountData: AccountData;
  @Prop()
  emailConfirmation: EmailConfirmation;
  @Prop()
  emailRecovery: EmailRecovery;
  @Prop()
  banInfo: UserBanInfo;
}

export const UserSchema = SchemaFactory.createForClass(User);
