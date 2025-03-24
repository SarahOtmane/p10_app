import Avatar from "../models/avatarModel";
import Ecurie from "../models/ecurieModel";
import GP_Classement from "../models/gp_classementModel";
import GP_Pilotes from "../models/gp_pilotesModel";
import GP from "../models/gpModel";
import League from "../models/leagueModel";
import PilotesEcurie from "../models/pilote_ecurieModel";
import Pilotes from "../models/piloteModel";
import Results from "../models/resultModel";
import Tracks from "../models/trackModel";
import UserLeague from "../models/user_leagueModel";
import User from "../models/userModel";

class TableManager {
    async createTables() {
        try {
            await Avatar.sync({ alter: true, force: false });
            await Ecurie.sync({ alter: true, force: false });
            await Tracks.sync({ alter: true, force: false });
            await GP.sync({ alter: true, force: false });
            await Pilotes.sync({ alter: true, force: false });
            await GP_Pilotes.sync({ alter: true, force: false });
            await GP_Classement.sync({ alter: true, force: false });
            await League.sync({ alter: true, force: false });
            await PilotesEcurie.sync({ alter: true, force: false });
            await UserLeague.sync({ alter: true, force: false });
            await User.sync({ alter: true, force: false });
            await Results.sync({ alter: true, force: false });
        } catch (error) {
            console.error("Erreur lors de la création des tables :", error);
        }
    }
}

export default new TableManager();