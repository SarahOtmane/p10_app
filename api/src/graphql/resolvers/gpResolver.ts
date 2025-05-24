import GP from '../../models/gpModel';

const gpResolvers = {
  Query: {
    // Tous les GP
    getAllGPs: async () => {
        try {
            return await GP.findAll();
        } catch (error) {
            console.error("Erreur lors de la récupération des GP :", error);
            throw new Error("Impossible de récupérer les GP.");
        }
    },

    // Un GP par son ID (id_api_races)
    getGPById: async (_: any, { id_api_races }: { id_api_races: number }) => {
        try {
            const gp = await GP.findByPk(id_api_races);
            if (!gp) throw new Error("GP introuvable.");
            return gp;
        } catch (error) {
            console.error("Erreur lors de la récupération du GP :", error);
            throw new Error("Impossible de récupérer ce GP.");
        }
    },
  },

  Mutation: {
    importGPsFromAPI: async (_: any, { year }: { year: string }) => {
        try {
            const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json`);
            const data = await res.json();
            const races = data.MRData.RaceTable.Races;
            
            let count = 0;
            for (const race of races) {
                const exists = await GP.findByPk(parseInt(race.round));
                if (exists) continue;
                
                await GP.create({
                  id_api_races: parseInt(race.round),
                  season: race.season,
                  date: race.date,
                  time: race.time.replace('Z', ''),
                  id_api_track: null // à remplir si les tracks sont gérés
                });
              
                count++;
            }
          
            return `${count} GPs importés pour l'année ${year}.`;
        } catch (error) {
            console.error('Erreur API GP :', error);
            throw new Error("Import échoué depuis l'API.");
        }
    }
  }
};

export default gpResolvers;
