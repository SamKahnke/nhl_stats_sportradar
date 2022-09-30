#### Installation
1. Unzip the files you recieved and save the parent directory as "nhl_stats".
2. Create a postgres database and edit the "database" values in config/default.json to match your new database.
3. Run ```nvm use 14``` or similar to switch to node 14.
4. Run ```npm install```.
5. Run ```npm start```.

#### Data Pipeline
When the app starts, it creates the necessary tables if they don't exist. Then, it gathers all game data and relevent statistics per player (only includes ongoing and completed games for this current season). As long as the app is running, it will record live games. If it's shut off and turned back on, it will record any missing data up to that point.

#### API
You can access the data through a few endpoints. With the app running, search ```http://localhost:3000``` in your browser, followed by a valid path:
##### /games
```http://localhost:3000/games``` Returns basic data for all games
##### /games/:gamePK
```http://localhost:3000/games/2022010004``` Returns basic data for a single game with id 2022010004
##### /games?homeTeamID=&awayTeamID=
```http://localhost:3000/games?awayTeamID=4&homeTeamID=7``` Returns all basic data for games where the team with id 4 was Away and the team with id 7 was Home. These parameters are optional. You can exclude awayTeamID and/or homeTeamID to remove them as filters.
##### /stats
```http://localhost:3000/stats``` Returns all statistics gathered from live games, each row representing a player's stats for a particular game.
##### /stats?gamePK=&playerID=&teamID=
```http://localhost:3000/stats?playerID=ID8480821&gamePK=2022010022&teamID=17``` Returns a single player's stats for a certain game, on a certain team. These parameters are optional. You can include and exclude gamePK, playerID, and/or teamID to use them as filters. For example, ```http://localhost:3000/stats?playerID=ID8480821``` would return a certain player's stats for every game they've played. If you wanted to only get stats for when that player was on team 17, you'd use ```http://localhost:3000/stats?playerID=ID8480821&teamID=17```.
##### / or /readme
Redirects to this README (Hello)
##### *
Defaults to an error page that redirects here
