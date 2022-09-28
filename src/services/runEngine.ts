import { checkForGames } from "./checkForGames";
import { recordGames } from "./recordGames";

export function runEngine(): void {
    // Queue
    let gamesQueue: string[] = [];
    let completeRecordedGames: string[] = [];

    // Search for games to record
    checkForGames(gamesQueue, completeRecordedGames)
    setInterval(() => {
        checkForGames(gamesQueue, completeRecordedGames);
    }, 10000);

    // Record games in queue
    setInterval(() => {
        if (gamesQueue.length > 0) {
            recordGames(gamesQueue, completeRecordedGames);
        }
    }, 1000);
}