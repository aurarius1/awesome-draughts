# ML Draughts / ML Dame
Implemented with love in vue.js & c# (.net).

### Prerequisites 
* Docker (if on windows: make sure to use linux containers)

### How to run
* go into the folder with the docker-compose.yml file 
* run ```docker-compose up -d --force-recreate```
* to stop run ```docker-compose down``` (in the same directory)

### Play
* go to http://localhost:7776 in your browser and start a game
* If you want to play in "multiplayer mode" use a second browser/incognito window

### Troubleshooting
* on some machines the replace_env.sh has CLRF line endings, if you encounter this problem (docker container won't build) open this file (frontend/docker/replace_env.sh) and change the line endings to LF. 
* if it doesn't look good: disable dark reader (or similar addons)

### BONUS: 
* Can you get the flag (be honest & don't copy it from the source code)?
