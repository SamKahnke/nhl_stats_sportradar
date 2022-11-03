import * as services from '.';

export function RunPipeline(): void {
    console.log('RunPipeline');
    // Queue
    const gamesQueue: string[] = [];
    const completeRecordedGames: string[] = [];

    // Search for games to record
    services.FindGames(gamesQueue, completeRecordedGames)
    setInterval(() => {
        services.FindGames(gamesQueue, completeRecordedGames);
    }, 30000);

    // Record games in queue
    setInterval(() => {
        if (gamesQueue.length > 0) {
            services.RecordGames(gamesQueue, completeRecordedGames);
        }
    }, 5000);
}