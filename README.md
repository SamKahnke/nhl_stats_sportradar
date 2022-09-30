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
##### /games/:gamePK
```http://localhost:3000/games``` Returns basic data for all games  
```http://localhost:3000/games/2022010004``` Returns basic data for a single game with id 2022010004
