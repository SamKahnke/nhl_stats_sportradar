import axios from "axios";
import { isGameRecordable } from "../utils/utils";
const config = require('config');

export async function checkForGames(gamesQueue: string[], completeRecordedGames: string[]): Promise<void> {
    try {
        const response = await axios.get(`${config.get('liveData.rootURL')}/schedule/?season=${config.get('liveData.startingSeason')}`);
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
    } catch (error) {
        console.error(error);
    }
}