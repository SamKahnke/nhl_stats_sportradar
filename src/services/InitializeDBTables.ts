import { db } from '../app';

export async function InitializeDBTables(): Promise<boolean> {
    console.log('InitializeDBTable');
    try {
        // games
        await db.query(
            `CREATE TABLE if not exists games (
                id serial primary key,
                game_pk integer NOT NULL,
                home_team_id integer NOT NULL,
                away_team_id integer NOT NULL,
                status integer NOT NULL,
                status_name varchar(30) NOT NULL
            )`
        );

        // stats
        await db.query(
            `CREATE TABLE if not exists stats (
                id serial primary key,
                game_pk integer NOT NULL,
                player_id varchar(30) NOT NULL,
                team_id integer NOT NULL,
                team_name varchar(30),
                name varchar(30),
                age integer,
                number integer,
                position varchar(30),
                assists integer,
                goals integer,
                hits integer,
                penalty_minutes integer
            )`
        );
        return true;
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error(error);
        }
        return false;
    }
}