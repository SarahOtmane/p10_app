import { GP_Pilotes } from "../../models";
import { MyContext } from "../../types/context";




const gpPilotesResolver = {
    Query: {
        getAllGpPilotes: async (_: any, __: any, context: MyContext) => {
            try {
                return await GP_Pilotes.findAll();
            } catch (error) {
                throw new Error("Erreur lors de la récupération des pilotes de GP.");
            }
        }
    }
}


export default gpPilotesResolver;