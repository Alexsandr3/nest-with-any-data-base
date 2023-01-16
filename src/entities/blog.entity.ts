import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostT } from "./post.entity";
import { BannedBlogUser } from "./bannedBlogUser.entity";
import { Usser } from "./user.entity";

@Entity()
export class BlogT {
  @PrimaryGeneratedColumn("uuid")
  blogId: string;
  @Column("boolean", { default: false })
  isBanned: boolean;
  @Column({ type: "character varying", length: 15, collation: "C" })
  name: string;
  @Column({ type: "character varying" })
  userLogin: string;
  @Column({ type: "character varying", length: 500, collation: "C" })
  description: string;
  @Column({ type: "character varying", length: 100, collation: "C" })
  websiteUrl: string;
  @Column({ type: "character varying" })
  createdAt: string;
  @Column({ type: "character varying", default: null })
  banDate: string;
  @Column({ type: "uuid" })
  userId: string;
  @ManyToOne(() => Usser, u => u.blogs)
  user: Usser;
  @OneToMany(() => PostT, u => u.blog)
  posts: PostT[];
  @OneToMany(() => BannedBlogUser, u => u.blog)
  bannedUsers: BannedBlogUser[];
}




