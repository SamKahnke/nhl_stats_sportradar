import * as services from '.';

export function RunPipeline(): void {
    console.log('RunPipeline');
    // Queue
    let gamesQueue: string[] = [];
    let completeRecordedGames: string[] = [];

    // Search for games to record
    services.FindGames(gamesQueue, completeRecordedGames)
    setInterval(() => {
        services.FindGames(gamesQueue, completeRecordedGames);
    }, 60000);

    // Record games in queue
    setInterval(() => {
        if (gamesQueue.length > 0) {
            services.RecordGames(gamesQueue, completeRecordedGames);
        }
    }, 10000);
}