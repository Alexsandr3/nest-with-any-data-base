import { BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { DeviceT } from "./device.entity";
import { BlogT } from "./blog.entity";
import { PostT } from "./post.entity";
import { CommentT } from "./comment.entity";
import { LikePost } from "./likePost.entity";
import { LikeComment } from "./likeComment.entity";
import { EmailConfirmation } from "./emailConfirmation.entity";
import { EmailRecovery } from "./emailRecovery.entity";

@Entity()
export class Usser extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  userId: string;
  @Column({ type: "character varying", length: 10, collation: "C" })
  login: string;
  @Column({ type: "character varying", collation: "C" })
  email: string;
  @Column({ type: "character varying" })
  passwordHash: string;
  @Column({ type: "character varying" })
  createdAt: string;
  @Column("boolean", { default: false })
  isBanned: boolean;
  @Column({ type: "character varying", default: null })
  banDate: string;
  @Column({ type: "character varying", default: null })
  banReason: string;
  @OneToOne(() => EmailConfirmation, ec => ec.user)
  emailConfirm: EmailConfirmation;
  @OneToOne(() => EmailRecovery, ec => ec.user)
  emailRecovery: EmailRecovery;
  @OneToMany(() => DeviceT, d => d.user, { cascade: true })
  device: DeviceT[];
  @OneToMany(() => BlogT, d => d.user)
  blogs: BlogT[];
  @OneToMany(() => PostT, d => d.user)
  posts: PostT[];
  @OneToMany(() => CommentT, d => d.user)
  comments: CommentT[];
  @OneToMany(() => LikePost, d => d.user)
  likePosts: LikePost[];
  @OneToMany(() => LikeComment, d => d.user)
  likeComments: LikeComment[];
}

