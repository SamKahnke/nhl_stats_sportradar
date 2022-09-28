import { FindGames } from "./FindGames";
import { RecordGames } from "./RecordGames";

export function RunPipeline(): void {
    console.log("RunPipeline");
    // Queue
    let gamesQueue: string[] = [];
    let completeRecordedGames: string[] = [];

    // Search for games to record
    FindGames(gamesQueue, completeRecordedGames)
    setInterval(() => {
        FindGames(gamesQueue, completeRecordedGames);
    }, 10000);

    // Record games in queue
    setInterval(() => {
        if (gamesQueue.length > 0) {
            RecordGames(gamesQueue, completeRecordedGames);
        }
    }, 1000);
}