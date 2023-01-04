import { Injectable } from "@nestjs/common";
import { BanInfoType, UsersViewType } from "./types-view/user-View-Model";
import { PaginationUsersDto } from "../../api/input-Dto/pagination-Users-Dto-Model";
import { PaginationViewModel } from "../../../blogs/infrastructure/query-repository/pagination-View-Model";
import {
  NotFoundExceptionMY,
  UnauthorizedExceptionMY
} from "../../../../helpers/My-HttpExceptionFilter";
import { MeViewModel } from "../../../auth/infrastructure/types-view/me-View-Model";
import { DataSource } from "typeorm";
import { UserDBSQLType } from "../../domain/types/user-DB-SQL-Type";


@Injectable()
export class UsersSqlQueryRepositories {
  constructor(
    private readonly dataSource: DataSource) {
  }

  private async mappedForUser(user: UserDBSQLType): Promise<UsersViewType> {
    const banInfo = new BanInfoType(
      user.isBanned,
      user.banDate,
      user.banReason
    );
    return new UsersViewType(
      user.userId,
      user.login,
      user.email,
      user.createdAt,
      banInfo
    );
  }

  async findUser(id: string): Promise<UsersViewType> {
    const query = `
        SELECT *
        FROM users
        WHERE "userId" = '${id}'
    `;
    const user = await this.dataSource.query(query);
    if (!user[0]) {
      throw new NotFoundExceptionMY(`Not found user with id: ${id}`);
    }
    return this.mappedForUser(user[0]);
  }

  async findUsers(data: PaginationUsersDto): Promise<PaginationViewModel<UsersViewType[]>> {
    const { searchEmailTerm, searchLoginTerm, pageNumber, pageSize, sortDirection, sortBy, banStatus } = data;
    //creating a request to get users with pagination
    let filter = `
        SELECT *
        FROM users
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${(pageNumber - 1) * pageSize}
    `;
    let filterCounting = `
        SELECT count(*)
        FROM users
    `;
    if (banStatus === "banned") {
      filter = `
          SELECT *
          FROM users
          WHERE "isBanned" = true
          ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${pageSize}
          OFFSET ${(pageNumber - 1) * pageSize}
      `;
      filterCounting = `
          SELECT count(*)
          FROM users
          WHERE "isBanned" = true
      `;
    }
    if (banStatus === "notBanned") {
      filter = `
          SELECT *
          FROM users
          WHERE "isBanned" = false
          ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${pageSize}
          OFFSET ${(pageNumber - 1) * pageSize}
      `;
      filterCounting = `
          SELECT count(*)
          FROM users
          WHERE "isBanned" = false
      `;
    }
    if (searchEmailTerm.trim().length > 0 || searchLoginTerm.trim().length > 0) {
      filter = `
          SELECT *
          FROM users
          WHERE email ILIKE '%${searchEmailTerm}%' 
       OR login ILIKE '%${searchLoginTerm}%'
          ORDER BY "${sortBy}" ${sortDirection}
              LIMIT ${pageSize}
          OFFSET ${(pageNumber - 1) * pageSize}
      `;
      filterCounting = `
          SELECT count(*)
          FROM users
          WHERE email ILIKE '%${searchEmailTerm}%'
       OR login ILIKE '%${searchLoginTerm}%'
      `;
    }
    const users = await this.dataSource.query(filter);
    //mapped user for View
    const mappedUsers = users.map((user) => this.mappedForUser(user));
    const items = await Promise.all(mappedUsers);
    const totalCount = await this.dataSource.query(filterCounting);
    const { count } = totalCount[0];
    const pagesCountRes = Math.ceil(+count / pageSize);
    // Found Users with pagination!
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      +count,
      items
    );
  }

  async getUserById(id: string): Promise<MeViewModel> {
    const query = `
        SELECT email, login, user_id AS "userId"
        FROM users
        WHERE "userId" = '${id}'
    `;
    const users = await this.dataSource.query(query);
    if (!users[0]) {
      throw new UnauthorizedExceptionMY(`incorrect userId`);
    } else {
      return users[0];
    }
  }
}
