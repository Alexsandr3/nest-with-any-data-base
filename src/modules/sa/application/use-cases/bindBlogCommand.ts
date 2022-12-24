export class BindBlogCommand {
  constructor(public readonly blogId: string,
              public readonly userId: string) {
  }
}
