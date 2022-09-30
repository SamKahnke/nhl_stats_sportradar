export interface Game {
    gamePK: string;
    homeTeamID: number;
    awayTeamID: number;
    status: number;
    statusName: string;
}

export interface Stat {
    gamePK: string;
    playerID: string;
    teamID: number;
    teamName: string | null;
    name: string | null;
    age: number;
    number: number;
    position: string | null;
    assists: number;
    goals: number;
    hits: number;
    penaltyMinutes: number;
}