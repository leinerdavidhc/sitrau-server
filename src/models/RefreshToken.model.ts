import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/db"; // Tu instancia de Sequelize

export class RefreshToken extends Model {
  public token!: string;      
  public userId!: number; 
  public expiresAt!: Date;    
}

// Definición del modelo en Sequelize
RefreshToken.init(
  {
    token: {
      type: DataTypes.STRING,
      allowNull: false,  
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,  
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,  
    },
  },
  {
    sequelize,
    modelName: "RefreshToken", 
    tableName: "refresh_tokens", 
    timestamps: true,
  }
);
