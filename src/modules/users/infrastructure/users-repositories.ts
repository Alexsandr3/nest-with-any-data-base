import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../domain/users-schema-Model";
import { PreparationUserForDB } from "../domain/user-preparation-for-DB";
import { ObjectId } from "mongodb";
import { UsersDBType } from "../domain/user-DB-Type";

@Injectable()
export class UsersRepositories {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
  }

  async createUser(newUser: PreparationUserForDB): Promise<string> {
    const createdUser = new this.userModel(newUser);
    const user = await createdUser.save();
    return user._id.toString();
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UsersDBType> {
    return this.userModel.findOne({
      $or: [
        { "accountData.email": loginOrEmail },
        { "accountData.login": loginOrEmail }
      ]
    });
  }

  async findUserByConfirmationCode(confirmationCode: string): Promise<UsersDBType> {
    return this.userModel.findOne({
      "emailConfirmation.confirmationCode": confirmationCode
    });
  }

  async updateConfirmation(_id: ObjectId): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: _id },
      {
        $set: { "emailConfirmation.isConfirmation": true }
      }
    );
    return result.modifiedCount === 1;
  }

  async findUserByRecoveryCode(recoveryCode: string): Promise<UsersDBType> {
    return this.userModel.findOne({
      "emailRecovery.recoveryCode": recoveryCode
    });
  }

  async updateCodeRecovery(_id: ObjectId, code: string, expirationDate: Date): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: _id },
      {
        $set: {
          "emailRecovery.recoveryCode": code,
          "emailRecovery.expirationDate": expirationDate
        }
      }
    );
    return result.modifiedCount === 1;
  }

  async updateRecovery(_id: ObjectId, passwordHash: string): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: _id },
      {
        $set: {
          "accountData.passwordHash": passwordHash,
          "emailRecovery.isConfirmation": true
        }
      }
    );
    return result.modifiedCount === 1;
  }

  async updateCodeConfirmation(_id: ObjectId, code: string, expirationDate: Date): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: _id },
      {
        $set: {
          "emailConfirmation.confirmationCode": code,
          "emailConfirmation.expirationDate": expirationDate
        }
      }
    );
    return result.modifiedCount === 1;
  }

  async updateBanInfoUser(userId: string, isBanned: boolean, banDate: string, banReason: string): Promise<boolean> {
    const result = await this.userModel.updateOne({ _id: new Object(userId) },
      { $set: { "banInfo.isBanned": isBanned, "banInfo.banDate": banDate, "banInfo.banReason": banReason } }
    );
    return result.modifiedCount === 1;
  }

  async findBanStatusUser(userId: string): Promise<UserDocument> {
    const banStatus = await this.userModel.findOne({ userId: userId });
    if (!banStatus) return null;
    return banStatus;
  }

  async findUserByIdWithMapped(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ _id: new Object(userId) });
    if (!user) return null;
    return user;
  }
}
