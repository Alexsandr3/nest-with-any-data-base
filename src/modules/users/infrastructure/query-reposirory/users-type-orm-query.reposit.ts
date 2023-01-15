import { Injectable } from "@nestjs/common";
import { BanInfoType, UsersViewType } from "./types-view/user-View-Model";
import { PaginationUsersDto } from "../../api/input-Dto/pagination-Users-Dto-Model";
import { PaginationViewModel } from "../../../blogs/infrastructure/query-repository/pagination-View-Model";
import { MeViewModel } from "../../../auth/infrastructure/types-view/me-View-Model";
import { ILike, Repository } from "typeorm";
import { IUserQueryRepository } from "../../interfaces/IUserQueryRepository";
import { InjectRepository } from "@nestjs/typeorm";
import { Usser } from "../../../../entities/user.entity";

@Injectable()
export class UsersTypeOrmQueryRepository implements IUserQueryRepository {
  constructor(
    @InjectRepository(Usser)
    private readonly userRepo: Repository<Usser>
  ) {
  }

  private mappedForUser(user: Usser): UsersViewType {
    const banInfo = new BanInfoType(user.isBanned, user.banDate, user.banReason);
    return new UsersViewType(user.userId, user.login, user.email, user.createdAt, banInfo);
  }

  async findUser(id: string): Promise<UsersViewType> {
    const user = await this.userRepo.findOneBy({ userId: id });
    if (!user) return null;
    return this.mappedForUser(user);
  }

  async findUsers(data: PaginationUsersDto): Promise<PaginationViewModel<UsersViewType[]>> {
    const { searchEmailTerm, searchLoginTerm, pageNumber, pageSize, sortBy, banStatus, sortDirection } = data;
    let order;
    if (sortDirection === "asc") {
      order = "ASC";
    } else {
      order = "DESC";
    }
    let filter = {};
    if (banStatus === "banned") {
      filter = { isBanned: true };
    }
    if (banStatus === "notBanned") {
      filter = { isBanned: false };
    }
    if (searchEmailTerm.trim().length > 0 || searchLoginTerm.trim().length > 0) {
      filter = [{ email: ILike(`%${searchEmailTerm}%`) }, { login: ILike(`%${searchLoginTerm}%`) }];
    }
    const [users, count] = await Promise.all([this.userRepo
      .find({
        select: ["userId", "login", "email", "createdAt", "isBanned", "banDate", "banReason"],
        where: filter,
        order: { [sortBy]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize
      })
      // .then((u) => {
      //   return u.map((u) => this.mappedForUser(u));
      // })
      // .catch(() => {
      //   return false;
      // })
      ,
      this.userRepo.count({ where: filter })
    ]);
    // if (users === false) throw new Error("Incorrect query data");
    //mapped user for View
    const mappedUsers = users.map((user) => this.mappedForUser(user));
    const items = await Promise.all(mappedUsers);
    const pagesCountRes = Math.ceil(count / pageSize);
    // Found Users with pagination!
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      count,
      items
    );
  }

  async getUserById(id: string): Promise<MeViewModel> {

    const { email, login, userId } = await this.userRepo
      .findOneBy({
        // select: { email: true, login: true, userId: true },
        // select: ["email", "login", "userId"],
        userId: id
      });
    return { email, login, userId };
    // if (!{ email, login, userId }) {
    //   throw new UnauthorizedExceptionMY(`incorrect userId`);
    // } else {
    //   return { email, login, userId };
    // }
  }
}


/*async findUsers(data: PaginationUsersDto): Promise<PaginationViewModel<UsersViewType[]>> {
    const { searchEmailTerm, searchLoginTerm, pageNumber, pageSize, sortBy, banStatus, sortDirection } = data;
    let order;
    if (sortDirection === "asc") {
      order = "ASC";
    } else {
      order = "DESC";
    }
    let filterWhere: [where: Brackets | string | ((qb: this) => string) | ObjectLiteral | ObjectLiteral[], parameters?: ObjectLiteral] = [{}];
    let filterOrWhere: [where: Brackets | string | ((qb: this) => string) | ObjectLiteral | ObjectLiteral[], parameters?: ObjectLiteral] = [{}];
    let filter = {};
    if (banStatus === "banned") {
      filterWhere = [{ isBanned: true }];
      filter = { isBanned: true };
    }
    if (banStatus === "notBanned") {
      filterWhere = [{ isBanned: false }];
      filter = { isBanned: false };
    }
    if (searchEmailTerm.trim().length > 0 || searchLoginTerm.trim().length > 0) {
      filterWhere = [`u.login Ilike :name`, { name: `%${searchLoginTerm}%` }];
      filterOrWhere = [`u.email Ilike :name`, { name: `%${searchEmailTerm}%` }];
      filter = [{ email: ILike(`%${searchEmailTerm}%`) }, { login: ILike(`%${searchLoginTerm}%`) }];
    }


    const [userss, countt] = await Promise.all([this.userRepo
      .find({
        select: ["userId", "login", "email", "createdAt", "isBanned", "banDate", "banReason"],
        where: filter,
        order: { [sortBy]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize
      }),
      this.userRepo.count({ where: filter })
    ]);


    const [builder, count] = await Promise.all([this.userRepo
      .createQueryBuilder("u")
      .where(...filterWhere)
      .orWhere(...filterOrWhere)
      .orderBy(`"${sortBy}"`, order)
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize),
      this.userRepo.count({ where: filter })
    ]);

    const sql = builder.getSql();
    await writeSql(sql);

    const users = await builder.getMany();
    //mapped user for View
    const mappedUsers = userss.map((user) => this.mappedForUser(user));
    const items = await Promise.all(mappedUsers);
    const totalCount = await this.userRepo.count();
    // const totalCount = await this.userRepo.query(filterCounting);
    const pagesCountRes = Math.ceil(countt / pageSize);
    // Found Users with pagination!
    return new PaginationViewModel(
      pagesCountRes, pageNumber, pageSize,
      countt, items);
  }*/

