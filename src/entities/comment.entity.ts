import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostT } from "./post.entity";
import { Usser } from "./user.entity";
import { LikeComment } from "./likeComment.entity";

@Entity()
export class CommentT {
  @PrimaryGeneratedColumn("uuid")
  commentId: string;
  @Column("boolean", { default: true })
  isBanned: boolean;
  @Column()
  postId: string;
  @Column()
  ownerId: string;
  @Column()
  userId: string;
  @Column()
  content: string;
  @Column()
  createdAt: string;
  @Column()
  userLogin: string;
  @ManyToOne(() => Usser, u => u.comments)
  user: Usser;
  @ManyToOne(() => PostT, u => u.comments)
  post: PostT;
  @OneToMany(() => LikeComment, u => u.comment)
  likeComment: LikeComment[];
}