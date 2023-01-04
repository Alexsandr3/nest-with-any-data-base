import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PreparationBlogForDB } from "../../../domain/types/blog-preparation-for-DB";
import { CreateBlogCommand } from "../create-blog-command";
import { UnauthorizedExceptionMY } from "../../../../../helpers/My-HttpExceptionFilter";
import { UsersSqlRepositories } from "../../../../users/infrastructure/users-sql-repositories";
import { BlogsSqlRepositories } from "../../../../blogs/infrastructure/blogs-sql.repositories";

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private readonly blogsRepositories: BlogsSqlRepositories,
    private readonly usersRepositories: UsersSqlRepositories
  ) {
  }

  async execute(command: CreateBlogCommand): Promise<string> {
    const { name, description, websiteUrl } = command.blogInputModel;
    const { userId } = command;
    //finding the user for check ex
    const user = await this.usersRepositories.findUserByIdWithMapped(userId);
    if (user.userId !== userId) throw new UnauthorizedExceptionMY(`user with id: ${userId} Unauthorized`);
    //preparation Blog for save in DB
    const newBlog = new PreparationBlogForDB(
      userId,
      user.login,
      name,
      description,
      websiteUrl,
      new Date().toISOString(),
      false
    );
    return await this.blogsRepositories.createBlog(newBlog);
  }
}
