import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostT } from "./post.entity";
import { Usser } from "./user.entity";

@Entity()
export class LikePost {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column("boolean", { default: false })
  isBanned: boolean;
  @Column({ type: "uuid" })
  parentId: string;
  @Column({ type: "character varying" })
  addedAt: string;
  @Column({ default: "None" })
  likeStatus: string;
  @Column({ type: "character varying" })
  userLogin: string;
  @Column({ type: "uuid" })
  userId: string;
  @ManyToOne(() => Usser, u => u.likePosts)
  user: Usser;
  @ManyToOne(() => PostT, u => u.likePost)
  post: PostT;
}


