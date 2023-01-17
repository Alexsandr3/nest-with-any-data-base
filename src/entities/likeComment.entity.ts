import { Column, Entity,  ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CommentT } from "./comment.entity";
import { Usser } from "./user.entity";

@Entity()
export class LikeComment {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column("boolean", { default: false })
  isBanned: boolean;
  @Column({ type: "uuid" })
  parentId: string;
  @Column({ default: "None" })
  likeStatus: string;
  @Column({ type: "uuid" })
  userId: string;
  @ManyToOne(() => Usser, u => u.likeComments)
  user: Usser;
  @ManyToOne(() => CommentT, u => u.likesComment)
  comment: CommentT;
}