import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Pour Neon
    },
  },
  logging: false,
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion PostgreSQL réussie !');
    await sequelize.sync({ alter: true }); // Synchroniser les modèles
    console.log('✅ Base de données synchronisée');
  } catch (error) {
    console.error('❌ Erreur de connexion à la DB :', error);
    process.exit(1);
  }
};
