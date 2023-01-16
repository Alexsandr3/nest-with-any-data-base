import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BlogT } from "./blog.entity";
import { CommentT } from "./comment.entity";
import { Usser } from "./user.entity";
import { LikePost } from "./likePost.entity";

@Entity()
export class PostT {
  @PrimaryGeneratedColumn("uuid")
  postId: string;
  @Column("boolean", { default: false })
  isBanned: boolean;
  @Column({ type: "uuid" })
  userId: string;
  @Column({ type: "character varying", length: 30 })
  title: string;
  @Column({ type: "character varying", length: 100 })
  shortDescription: string;
  @Column({ type: "character varying", length: 1000 })
  content: string;
  @Column({ type: "character varying" })
  createdAt: string;
  @Column({ type: "character varying" })
  blogName: string;
  @Column({ type: "uuid" })
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



