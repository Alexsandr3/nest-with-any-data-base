import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, LeanDocument, Model } from "mongoose";
import { User, UserDocument } from "../../domain/users-schema-Model";
import { ObjectId } from "mongodb";
import { BanInfoType, UsersViewType } from "./user-View-Model";
import { PaginationUsersDto } from "../../api/input-Dto/pagination-Users-Dto-Model";
import { PaginationViewModel } from "../../../blogs/infrastructure/query-repository/pagination-View-Model";
import {
  NotFoundExceptionMY,
  UnauthorizedExceptionMY
} from "../../../../helpers/My-HttpExceptionFilter";
import { MeViewModel } from "../../../auth/infrastructure/me-View-Model";


@Injectable()
export class UsersQueryRepositories {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>) {
  }

  private async mappedForUser(user: LeanDocument<UserDocument>): Promise<UsersViewType> {
    const banInfo = new BanInfoType(
      user.banInfo.isBanned,
      user.banInfo.banDate,
      user.banInfo.banReason
    );
    return new UsersViewType(
      user._id.toString(),
      user.accountData.login,
      user.accountData.email,
      user.accountData.createdAt,
      banInfo
    );
  }

  async findUser(id: string): Promise<UsersViewType> {
    const user = await this.userModel.findOne({ _id: new Object(id) });
    if (!user) {
      throw new NotFoundExceptionMY(`Not found user with id: ${id}`);
    }
    return this.mappedForUser(user);
  }

  async findUsers(data: PaginationUsersDto): Promise<PaginationViewModel<UsersViewType[]>> {
    const { banStatus, pageNumber, pageSize, searchEmailTerm, searchLoginTerm, sortDirection, sortBy } = data;
    const filter: FilterQuery<User> = {};
    if (banStatus === "banned") {
      filter["banInfo.isBanned"] = true;
    }
    if (banStatus === "notBanned") {
      filter["banInfo.isBanned"] = false;
    }
    if (searchEmailTerm.trim().length > 0 && searchLoginTerm.trim().length === 0) {
      filter["accountData.email"] = { $regex: searchEmailTerm, $options: "i" };
    }
    if (searchLoginTerm.trim().length > 0 && searchEmailTerm.trim().length === 0) {
      filter["accountData.login"] = { $regex: searchLoginTerm, $options: "i" };
    }
    if (searchLoginTerm.trim().length > 0 && searchEmailTerm.trim().length > 0) {
      filter["$or"] = [{ "accountData.login": { $regex: searchLoginTerm, $options: "i" } },
        { "accountData.email": { $regex: searchEmailTerm, $options: "i" } }];
    }
    const foundsUsers = await this.userModel
      .find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [`accountData.${sortBy}`]: sortDirection })
      .lean();
    //mapped user for View
    const mappedUsers = foundsUsers.map((user) => this.mappedForUser(user));
    const items = await Promise.all(mappedUsers);
    //counting users
    const totalCount = await this.userModel.countDocuments(filter);
    const pagesCountRes = Math.ceil(totalCount / pageSize);
    // Found Users with pagination!
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      totalCount,
      items
    );
  }

  async getUserById(id: string): Promise<MeViewModel> {
    const user = await this.userModel.findOne({ _id: new ObjectId(id) });
    if (!user) {
      throw new UnauthorizedExceptionMY(`incorrect userId`);
    } else {
      return new MeViewModel(
        user.accountData.email,
        user.accountData.login,
        user._id.toString()
      );
    }
  }
}
