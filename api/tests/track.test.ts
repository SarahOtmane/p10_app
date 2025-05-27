import trackResolvers from "../src/graphql/resolvers/trackResolver";
import Tracks from "../src/models/trackModel";


jest.mock("../src/models/trackModel", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
}));

describe("trackResolvers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Query.getAllTracks", () => {
    it("should return all tracks (success)", async () => {
      const fakeTracks = [{ id: 1, name: "Track 1" }, { id: 2, name: "Track 2" }];
      (Tracks.findAll as any).mockResolvedValue(fakeTracks);

      const result = await trackResolvers.Query.getAllTracks();
      expect(result).toEqual(fakeTracks);
      expect(Tracks.findAll).toHaveBeenCalled();
    });

    it("should throw an error if findAll fails", async () => {
      (Tracks.findAll as any).mockRejectedValue(new Error("DB error"));

      await expect(trackResolvers.Query.getAllTracks()).rejects.toThrow("Impossible de récupérer les circuits.");
      expect(Tracks.findAll).toHaveBeenCalled();
    });
  });

  describe("Query.getTrackById", () => {
    it("should return a track by id (success)", async () => {
      const fakeTrack = { id_api_races: 1, name: "Track 1" };
      (Tracks.findByPk as any).mockResolvedValue(fakeTrack);

      const result = await trackResolvers.Query.getTrackById({}, { id_api_races: 1 });
      expect(result).toEqual(fakeTrack);
      expect(Tracks.findByPk).toHaveBeenCalledWith(1);
    });

    it("should throw an error if track not found", async () => {
      (Tracks.findByPk as any).mockResolvedValue(null);

      await expect(trackResolvers.Query.getTrackById({}, { id_api_races: 999 }))
        .rejects.toThrow("Impossible de récupérer le circuit.");
      expect(Tracks.findByPk).toHaveBeenCalledWith(999);
    });

    it("should throw an error if findByPk fails", async () => {
      (Tracks.findByPk as any).mockRejectedValue(new Error("DB error"));

      await expect(trackResolvers.Query.getTrackById({}, { id_api_races: 1 }))
        .rejects.toThrow("Impossible de récupérer le circuit.");
      expect(Tracks.findByPk).toHaveBeenCalledWith(1);
    });
  });
});