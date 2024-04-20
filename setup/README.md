As I am still learning the development process with NodeJS and NextJS I have not gotten to the point of properly configuring an environment setup and I wanted to just dive into the code. 

The things in this folder are purely for assisting in setting up the environment so that this can be deployed onto a server.

You can install and build the database with the below commands, obviously change [password] with a password for the ecb_user:
```sh
sudo apt-get install postgresql
sudo systemctl enable postgresql
sudo systemctl start postgresql

sudo -u postgres psql
CREATE USER ecb_user WITH PASSWORD '[password]';
CREATE DATABASE ecb OWNER ecb_user;
\q

sudo useradd -G users ecb_user
echo "ecb_user:[password]' | sudo chpasswd

node setup/setup_database.js
```

Then setup redis with the below commands:
```sh
sudo apt install lsb-release curl gpg
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

Make sure to update the .env file in the chatbot data directory with the database username, password and redis connection info. You will also need to create a twitch.tv user account for the bot, generate the correct token info and update the .env file with this as well. I generated this using https://twitchtokengenerator.com.

To set up the backend systemd service, first modify the eagles-chatbot.service file for the location of chatbot data directory.
Then run the following:
```sh
sudo cp eagles-chatbot.service /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable eagles-chatbot.service
sudo systemctl start eagles-chatbot.service
```

# File List
- eagles-chatbot.service: To be placed in /lib/systemd/system/ to enable and start the systemd service for the backend.
- setup_database.js: After the database itself is created and your .env file setup, this can be ran with node via commandline to create the tables and functions, and populate some basic values for functionality.
