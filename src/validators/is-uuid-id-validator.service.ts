import {
  ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface
} from "class-validator";
import { Injectable } from "@nestjs/common";
import {
  BlogsSqlQueryRepositories
} from "../modules/blogs/infrastructure/query-repository/blogs-sql-query.repositories";


@ValidatorConstraint({ name: "IsUuidCustom", async: true })
@Injectable()
export class BlogUuidIdValidator implements ValidatorConstraintInterface {
  constructor(
    private readonly blogsQueryRepositories: BlogsSqlQueryRepositories
  ) {
  }

  async validate(blogId: string) {
    try {
      const blog = await this.blogsQueryRepositories.findBlog(blogId);
      if (!blog) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return "Blog doesn't exist";
  }
}
