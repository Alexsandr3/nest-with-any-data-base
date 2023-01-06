import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PreparationBlogForDB } from "../../../domain/types/blog-preparation-for-DB";
import { CreateBlogCommand } from "../create-blog-command";
import { UnauthorizedExceptionMY } from "../../../../../helpers/My-HttpExceptionFilter";
import { Inject } from "@nestjs/common";
import { IBlogRepository, IBlogRepositoryKey } from "../../../../blogs/interfaces/IBlogRepository";
import { IUserRepository, IUserRepositoryKey } from "../../../../users/interfaces/IUserRepository";

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @Inject(IBlogRepositoryKey)
    private readonly blogsRepositories: IBlogRepository,
    @Inject(IUserRepositoryKey)
    private readonly usersRepositories: IUserRepository
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
