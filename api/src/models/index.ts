// Import des modèles
import Avatar from './avatarModel';
import Ecurie from './ecurieModel';
import GP from './gpModel';
import GP_Classement from './gp_classementModel';
import GP_Pilotes from './gp_pilotesModel';
import League from './leagueModel';
import Pilote from './piloteModel';
import PilotesEcurie from './pilote_ecurieModel';
import Results from './resultModel';
import Tracks from './trackModel';
import User from './userModel';
import UserLeague from './user_leagueModel';

// GP <-> Track
GP.belongsTo(Tracks, { foreignKey: 'id_api_track' });
Tracks.hasMany(GP, { foreignKey: 'id_api_track' });

// GP_Classement <-> GP_Pilotes
GP_Classement.belongsTo(GP_Pilotes, { foreignKey: 'id_gp_pilote' });
GP_Pilotes.hasMany(GP_Classement, { foreignKey: 'id_gp_pilote' });

// GP_Pilotes <-> GP
GP_Pilotes.belongsTo(GP, { foreignKey: 'id_gp' });
GP.hasMany(GP_Pilotes, { foreignKey: 'id_gp' });

// GP_Pilotes <-> Pilotes
GP_Pilotes.belongsTo(Pilote, { foreignKey: 'id_pilote' });
Pilote.hasMany(GP_Pilotes, { foreignKey: 'id_pilote' });

// GP_Pilotes <-> Ecuries
GP_Pilotes.belongsTo(Ecurie, { foreignKey: 'id_ecurie' });
Ecurie.hasMany(GP_Pilotes, { foreignKey: 'id_ecurie' });

// PilotesEcurie <-> Pilote
PilotesEcurie.belongsTo(Pilote, { foreignKey: 'id_pilote' });
Pilote.hasMany(PilotesEcurie, { foreignKey: 'id_pilote' });

// PilotesEcurie <-> Ecurie
PilotesEcurie.belongsTo(Ecurie, { foreignKey: 'id_ecurie' });
Ecurie.hasMany(PilotesEcurie, { foreignKey: 'id_ecurie' });

// Results <-> User
Results.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(Results, { foreignKey: 'id_user' });

// Results <-> GP
Results.belongsTo(GP, { foreignKey: 'id_gp' });
GP.hasMany(Results, { foreignKey: 'id_gp' });

// Results <-> Pilote
Results.belongsTo(Pilote, { foreignKey: 'id_pilote_p10' });
Pilote.hasMany(Results, { foreignKey: 'id_pilote_p10' });

// User <-> Avatar
User.belongsTo(Avatar, { foreignKey: 'id_avatar' });
Avatar.hasMany(User, { foreignKey: 'id_avatar' });

// User <-> League (Many-to-Many relationship through UserLeague)
User.belongsToMany(League, {
  through: UserLeague,
  foreignKey: 'id_user',
  otherKey: 'id_league',
});
League.belongsToMany(User, {
  through: UserLeague,
  foreignKey: 'id_league',
  otherKey: 'id_user',
});

League.hasMany(UserLeague, { foreignKey: 'id_league' });
UserLeague.belongsTo(League, { foreignKey: 'id_league' });

User.hasMany(UserLeague, { foreignKey: 'id_user' });
UserLeague.belongsTo(User, { foreignKey: 'id_user' });


// Export des modèles
export {
  Avatar,
  Ecurie,
  GP,
  GP_Classement,
  GP_Pilotes,
  League,
  Pilote,
  PilotesEcurie,
  Results,
  Tracks,
  User,
  UserLeague
};
