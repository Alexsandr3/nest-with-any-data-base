export class DeleteBlogCommand {
  constructor(public readonly blogId: string, public readonly userId: string) {}
}
