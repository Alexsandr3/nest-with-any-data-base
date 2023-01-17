import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostT } from "./post.entity";
import { Usser } from "./user.entity";
import { LikeComment } from "./likeComment.entity";

@Entity()
export class CommentT {
  @PrimaryGeneratedColumn("uuid")
  commentId: string;
  @Column("boolean", { default: false })
  isBanned: boolean;
  @Column({ type: "uuid" })
  postId: string;
  @Column({ type: "uuid" })
  ownerId: string;
  @Column({ type: "uuid" })
  userId: string;
  @Column({ type: "character varying", length: 300 })
  content: string;
  @Column({ type: "character varying" })
  createdAt: string;
  @Column({ type: "character varying" })
  userLogin: string;
  @ManyToOne(() => Usser, u => u.comments)
  user: Usser;
  @ManyToOne(() => PostT, u => u.comments)
  post: PostT;
  @OneToMany(() => LikeComment, u => u.comment)
  likesComment: LikeComment[];
}