import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Trim } from "../../../../helpers/decorator-trim";

export enum SortDirectionType {
  Asc = "asc",
  Desc = "desc",
}

export class PaginationDto {
  /**
   *  Search term for blog Name: Name should contain this term in any position
   */
  @IsString()
  @IsOptional()
  searchNameTerm: string = "";
  /**
   *  pageNumber is number of portions that should be returned
   */
  @IsNumber()
  @IsOptional()
  pageNumber: number = 1;
  /**
   * pageSize is portions size that should be returned
   */
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
}
