import {
  ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface
} from "class-validator";
import { Inject, Injectable } from "@nestjs/common";
import { IBlogQueryRepository, IBlogQueryRepositoryKey } from "../modules/blogs/interfaces/IBlogQueryRepository";


@ValidatorConstraint({ name: "IsUuidCustom", async: true })
@Injectable()
export class BlogUuidIdValidator implements ValidatorConstraintInterface {
  constructor(
    @Inject(IBlogQueryRepositoryKey)
    private readonly blogsQueryRepositories: IBlogQueryRepository
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
