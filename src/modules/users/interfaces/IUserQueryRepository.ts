import { PaginationViewModel } from "../../blogs/infrastructure/query-repository/pagination-View-Model";
import { PaginationUsersDto } from "../api/input-Dto/pagination-Users-Dto-Model";
import { MeViewModel } from "../../auth/infrastructure/types-view/me-View-Model";
import { UsersSqlQueryRepositories } from "../infrastructure/query-reposirory/users-sql-query.reposit";
import { UsersViewType } from "../infrastructure/query-reposirory/types-view/user-View-Model";
import { UsersQueryRepositories } from "../infrastructure/query-reposirory/users-query.reposit";
import { getConfiguration } from "../../../config/configuration";

export interface IUserQueryRepository {
  findUser(id: string): Promise<UsersViewType>;

  findUsers(data: PaginationUsersDto): Promise<PaginationViewModel<UsersViewType[]>>;

  getUserById(id: string): Promise<MeViewModel>;

}

export const IUserQueryRepositoryKey = "IUserQueryRepository";


export const UserQueryRepository = () => {
  const dbType = getConfiguration().database.DB_TYPE
  switch (dbType) {
    case "MongoDB":
      return {
        provide: IUserQueryRepositoryKey,
        useClass: UsersQueryRepositories
      };
    case "RawSQL":
      return {
        provide: IUserQueryRepositoryKey,
        useClass: UsersSqlQueryRepositories
      };
    default:
      return {
        provide: IUserQueryRepositoryKey,
        useClass: UsersSqlQueryRepositories
      };
  }
};

//
// @Injectable()
// export class UserQueryRepository {
//   constructor(private configService: ConfigService<ConfigType>) {
//   }
//
//   static exec() {
//     const dbType = this.configService.get("database", { infer: true });
//     console.log("dbType", dbType);
//
//     switch (dbType.DB_TYPE) {
//       case "MongoDB":
//         return {
//           provide: IUserQueryRepositoryKey,
//           useClass: UsersQueryRepositories
//         };
//       case "RawSQL":
//         return {
//           provide: IUserQueryRepositoryKey,
//           useClass: UsersSqlQueryRepositories
//         };
//       default:
//         return {
//           provide: IUserQueryRepositoryKey,
//           useClass: UsersSqlQueryRepositories
//         };
//     }
//   }
// };


