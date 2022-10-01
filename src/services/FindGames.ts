import axios from 'axios';
import { isGameRecordable } from './utils';
const config = require('config');

export async function FindGames(gamesQueue: string[], completeRecordedGames: string[]): Promise<void> {
    console.log('FindGames');
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
        if (process.env.NODE_ENV !== 'test') {
            console.error(error);
        }
    }
}