import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'faq',
  timestamps: false,
})
export class Faq extends Model {
  @ApiProperty()
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  categoria: string;

  @ApiProperty()
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  pergunta: string;

  @ApiProperty()
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  resposta: string;
}
