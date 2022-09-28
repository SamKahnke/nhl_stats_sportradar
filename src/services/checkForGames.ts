import axios from "axios";
import { root } from "../app";
import { isGameRecordable } from "../utils/utils";

export async function checkForGames(gamesQueue, completeRecordedGames) {
    try {
        const response = await axios.get(`${root}/schedule/?season=20222023`);
        for (let date of response.data.dates) {
            for (let game of date.games) {
                if (isGameRecordable(game.status.statusCode)
                    && !gamesQueue.includes(game.gamePk)
                    && !completeRecordedGames.includes(game.gamePk))
                {
                    gamesQueue.push(game.gamePk);
                }
            }
        };
        console.log(`checkForGames() found ${gamesQueue.length} games that need recording`);
        console.log('gamesQueue', gamesQueue);
    } catch (error) {
        console.error(error);
    }
}