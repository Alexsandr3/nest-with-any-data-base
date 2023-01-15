import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostT } from "./post.entity";
import { BannedBlogUser } from "./bannedBlogUser.entity";
import { Usser } from "./user.entity";

@Entity()
export class BlogT {
  @PrimaryGeneratedColumn("uuid")
  blogId: string;
  @Column("boolean", { default: true })
  isBanned: boolean;
  @Column()
  name: string;
  @Column()
  userLogin: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column()
  createdAt: string;
  @Column()
  banDate: string;
  @Column()
  userId: string;
  @ManyToOne(() => Usser, u => u.blogs)
  user: Usser;
  @OneToMany(() => PostT, u => u.blog)
  posts: PostT[];
  @OneToMany(() => BannedBlogUser, u => u.blog)
  bannedUsers: BannedBlogUser[];
}




