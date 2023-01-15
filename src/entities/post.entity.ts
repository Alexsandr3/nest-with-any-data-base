import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BlogT } from "./blog.entity";
import { CommentT } from "./comment.entity";
import { Usser } from "./user.entity";
import { LikePost } from "./likePost.entity";

@Entity()
export class PostT {
  @PrimaryGeneratedColumn("uuid")
  postId: string;
  @Column("boolean", { default: true })
  isBanned: boolean;
  @Column()
  userId: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @Column()
  createdAt: string;
  @Column()
  blogName: string;
  @Column()
  blogId: string;
  @ManyToOne(() => Usser, u => u.posts)
  user: Usser;
  @ManyToOne(() => BlogT, u => u.posts)
  blog: BlogT;
  @OneToMany(() => CommentT, u => u.post)
  comments: CommentT[];
  @OneToMany(() => LikePost, u => u.post)
  likePost: LikePost[];
}



