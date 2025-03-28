import fs from 'fs-extra';

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

const directoryPath = './public/images';

async function synchroAvatar() {
    try {
        const exists = await fs.pathExists(directoryPath);
        if (!exists) {
            console.warn(`Le dossier ${directoryPath} n'existe pas. Synchronisation annulée.`);
            return;
        }
      
        const files = fs.readdirSync(directoryPath);
      
        for (const file of files) {
            // Vérifie si le fichier est déjà en BDD
            if (file.match(/\.(jpg|jpeg|png)$/)) {
                const alreadyExists = await Avatar.findOne({ where: { picture_avatar: file } });
                if (alreadyExists) {
                    console.log(`${file} déjà présent, ignoré.`);
                    continue;
                } 
              
                  await Avatar.create({ picture_avatar: file });
            }
        }
    }   catch (error) {
        console.error("Erreur lors de la synchronisation des avatars :", error);
    }
}

class TableManager {
    async createTables() {
        try {
            await synchroAvatar();
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

            console.log("Tables créées avec succès !");
        } catch (error) {
            console.error("Erreur lors de la création des tables :", error);
        }
    }
}

export default new TableManager();