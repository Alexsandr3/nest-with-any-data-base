import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Usser } from "./user.entity";

@Entity()
export class EmailRecovery {
  @PrimaryColumn({ type: "uuid" })
  userId: string;
  @Column({ type: "character varying" })
  recoveryCode: string;
  @Column({ type: "timestamptz" })
  expirationDate: Date;
  @Column("boolean", { default: false })
  isConfirmation: boolean;
  @OneToOne(() => Usser)
  @JoinColumn({ referencedColumnName: "userId" })
  user: Usser;
}