import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostT } from "./post.entity";
import { Usser } from "./user.entity";

@Entity()
export class LikePost {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column("boolean", { default: true })
  isBanned: boolean;
  @Column()
  parentId: string;
  @Column()
  addedAt: string;
  @Column({default: 'None'})
  likeStatus: string;
  @Column()
  userLogin: string;
  @Column()
  userId: string;
  @ManyToOne(() => Usser, u => u.likePosts)
  user: Usser;
  @ManyToOne(() => PostT, u => u.likePost)
  post: PostT;
}


