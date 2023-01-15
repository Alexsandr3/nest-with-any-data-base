import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BlogT } from "./blog.entity";

@Entity()
export class BannedBlogUser {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  ownerId: string;
  @Column()
  userId: string;
  @Column()
  login: string;
  @Column()
  email: string;
  @Column()
  createdAt: string;
  @Column("boolean", { default: true })
  isBanned: boolean;
  @Column({default: null})
  banDate: string;
  @Column({default: null})
  banReason: string;
  @Column()
  blogId: string;
  @ManyToOne(() => BlogT, u => u.bannedUsers)
  blog: BlogT;
}