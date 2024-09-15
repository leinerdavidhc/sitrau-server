import {DataTypes, Model} from "sequelize"
import {sequelize} from "../database/db"


export class User extends Model{
    public id!: number;
    public dni!: string;
    public name!: string;
    public lastName!: string;
    public email!: string;
    public phone!: string;
    public password!: string;
    public active!: boolean;
}


export interface UserGetI{
    id: number;
    dni: string;
    name: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    active: boolean;
}

export type UserAddI=Omit<UserGetI, "id" | "active">


User.init({
    dni: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
},{
    sequelize,
    tableName: "users",
    timestamps: true
})
