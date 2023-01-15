import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Usser } from "./user.entity";

@Entity()
export class DeviceT {
  @PrimaryColumn({ type: "uuid" })
  deviceId: string;
  @Column({ type: "character varying" })
  ip: string;
  @Column({ type: "character varying" })
  title: string;
  @Column({ type: "character varying" })
  lastActiveDate: string;
  @Column({ type: "character varying" })
  expiredDate: string;
  @Column({ type: "uuid" })
  userId: string;
  @ManyToOne(() => Usser, u => u.device)
  user: Usser;
}







