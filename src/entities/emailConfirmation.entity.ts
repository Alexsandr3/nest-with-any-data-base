import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Usser } from "./user.entity";

@Entity()
export class EmailConfirmation {
  @PrimaryColumn({ type: "uuid" })
  userId: string;
  @Column({ type: "character varying" })
  confirmationCode: string;
  @Column({ type: "timestamptz" })
  expirationDate: Date;
  @Column("boolean", { default: false })
  isConfirmation: boolean;
  @OneToOne(() => Usser)
  @JoinColumn({referencedColumnName: "userId"})
  user: Usser;
}
