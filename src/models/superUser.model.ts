import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database/db";

export class SuperUser extends Model{
    public id!: number;
    public name!: string;
    public lastName!: string;
    public password!: string;
    public email!: string;
    public active!: boolean;
}

export interface SuperUserGetI{
    id: number;
    name: string;
    lastName: string;
    password: string;
    email: string;
    active: boolean;
}

export type SuperUserAddI=Omit<SuperUserGetI, "id" | "active">


SuperUser.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
},{
    sequelize,
    tableName: "superusers",
    timestamps: true
})