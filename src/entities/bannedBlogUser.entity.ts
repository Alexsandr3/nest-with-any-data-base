import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BlogT } from "./blog.entity";

@Entity()
export class BannedBlogUser {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column({ type: "uuid" })
  ownerId: string;
  @Column({ type: "uuid" })
  userId: string;
  @Column({ type: "character varying" })
  login: string;
  @Column({ type: "character varying" })
  email: string;
  @Column({ type: "character varying" })
  createdAt: string;
  @Column("boolean", { default: false })
  isBanned: boolean;
  @Column({ default: null })
  banDate: string;
  @Column({ default: null })
  banReason: string;
  @Column({ type: "uuid" })
  blogId: string;
  @ManyToOne(() => BlogT, u => u.bannedUsers)
  blog: BlogT;
}