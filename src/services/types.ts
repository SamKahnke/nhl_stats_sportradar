export interface Game {
    gamePK: string;
    homeTeamID: number;
    awayTeamID: number;
    status: number;
    statusName: string;
}

export interface GameStat {
    gamePK: string;
    playerID: string;
    teamID: number;
    teamName: string | undefined | null;
    name: string | undefined | null;
    age: number;
    number: number;
    position: string | undefined | null;
    assists: number;
    goals: number;
    hits: number;
    penaltyMinutes: number;
}