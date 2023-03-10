import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode, Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards, UsePipes
} from "@nestjs/common";
import { CreateUserDto } from "./input-Dto/create-User-Dto-Model";
import { UsersService } from "../domain/users.service";
import { UsersViewType } from "../infrastructure/query-reposirory/types-view/user-View-Model";
import { PaginationUsersDto } from "./input-Dto/pagination-Users-Dto-Model";
import { BasicAuthGuard } from "../../../guards/basic-auth.guard";
import { CommandBus } from "@nestjs/cqrs";
import { DeleteUserCommand } from "../application/use-cases/delete-user-command";
import { UpdateBanInfoDto } from "./input-Dto/update-ban-info-Dto-Model";
import { UpdateBanInfoCommand } from "../application/use-cases/updateBanInfoCommand";
import { CreateUserSaCommand } from "../application/use-cases/create-user-sa-command";
import { ValidateUuidPipe } from "../../../validators/validate-uuid-pipe";
import { PaginationViewModel } from "../../blogs/infrastructure/query-repository/pagination-View-Model";
import { SkipThrottle } from "@nestjs/throttler";
import { IUserQueryRepository, IUserQueryRepositoryKey } from "../interfaces/IUserQueryRepository";

@SkipThrottle()
@Controller(`sa/users`)
export class UsersController {
  constructor(private readonly usersService: UsersService,
              @Inject(IUserQueryRepositoryKey)
              private readonly usersQueryRepositories: IUserQueryRepository,
              private commandBus: CommandBus
  ) {
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  @Put(`/:userId/ban`)
  async updateBanInfo(@Body() updateBanInfoModel: UpdateBanInfoDto,
                      @Param(`userId`) userId: string): Promise<boolean> {
    return this.commandBus.execute(new UpdateBanInfoCommand(updateBanInfoModel, userId));
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(@Body() userInputModel: CreateUserDto): Promise<UsersViewType> {
    return this.commandBus.execute(new CreateUserSaCommand(userInputModel));
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  async findUsers(@Query() paginationInputModel: PaginationUsersDto): Promise<PaginationViewModel<UsersViewType[]>> {
    return this.usersQueryRepositories.findUsers(paginationInputModel);
  }

  @UseGuards(BasicAuthGuard)
  @UsePipes(new ValidateUuidPipe())
  @HttpCode(204)
  @Delete(`:userId`)
  async deleteUser(@Param(`userId`) userId: string): Promise<boolean> {
    return await this.commandBus.execute(new DeleteUserCommand(userId));
  }
  
}
