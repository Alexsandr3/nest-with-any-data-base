import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Trim } from "../../../../helpers/decorator-trim";

export enum SortDirectionType {
  Asc = "asc",
  Desc = "desc",
}

export enum BanStatusType {
  all = "all",
  banned = "banned",
  notBanned = "notBanned",
}

export class PaginationUsersDto {
  /**
   * banStatus by parameters
   */
  @IsString()
  @IsEnum(BanStatusType)
  @IsOptional()
  banStatus: BanStatusType = BanStatusType.all;
  /**
   *  pageNumber is number of portions that should be returned
   */
  @IsNumber()
  @IsOptional()
  pageNumber: number = 1;
  /**
   * pageSize is portions size that should be returned
   */
    //@Type(()=> Number)
  @IsNumber()
  @IsOptional()
  pageSize: number = 10;
  /**
   * Sort by parameters
   */
  @Trim()
  @IsString()
  @IsOptional()
  sortBy = "createdAt";
  /**
   * Sort by desc or asc
   */
  @Trim()
  @IsEnum(SortDirectionType)
  @IsOptional()
  sortDirection: SortDirectionType = SortDirectionType.Desc;
  /**
   * Search term for user Login: Login should contain this term in any position
   */
  @IsString()
  @IsOptional()
  searchLoginTerm: string = "";
  /**
   *  Search term for user Email: Email should contains this term in any position
   */
  @IsString()
  @IsOptional()
  searchEmailTerm: string = "";
}
