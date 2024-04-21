As I am still learning the development process with NodeJS and NextJS I have not gotten to the point of properly configuring an environment setup and I wanted to just dive into the code. 

The things in this folder are purely for assisting in setting up the environment so that this can be deployed onto a server.

I usually use Ubuntu Server LTS, which needs a repo add for newer versions of NodeJS:
```sh
sudo apt update
sudo apt upgrade
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

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

Here are the variables needed in the .env file:
```
USERNAME=
TOKEN=
CHANNEL=
DATABASE=ecb
PGUSER=ecb_user
PGPASS=
REDDISURL=reddis://127.0.0.1:6379
```
Before setting up the services, we need to compile the app:
```sh
cd /data/eagles-chatbot
npm install
npm run build
```

To set up the backend systemd service, first modify the eagles-chatbot-backend.service file for the location of chatbot data directory.
Then run the following:
```sh
sudo cp eagles-chatbot-backend.service /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable eagles-chatbot-backend.service
sudo systemctl start eagles-chatbot-backend.service
```
To set up the frontend systemd service, first modify the eagles-chatbot-frontend.service file for the location of the chatbot data directory.
Then run the following:
```sh
sudo cp eagles-chatbot-frontend.service /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable eagles-chatbot-backend.service
sudo systemctl start eagles-chatbot-backend.service
```

I am also using nginx for the proxy-pass of port 80 and in the future 443 to the node application.
```sh
# Install nginx
sudo apt-get install nginx

# Disable Default Site
sudo rm /etc/nginx/sites-enabled/default

# Copy New Site Config
sudo cp eagles-chatbot-nginx /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/eagles-chatbot-nginx /etc/nginx/sites-enabled/eagles-chatbot-nginx

# Enable and start nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

Additionally I use tmux, and make a window split for watching things while the frontend is not yet ready. Below are a few of the commands I use in each of the window panes:
```sh
# To watch the log as things are happening in the chatbot
sudo journalctl -fu eagles-chatbot-backend --no-hostname | egrep -i '\[BOT\]'

# To watch the userlist as people join/chat/leave
sudo -u ecb_user watch -n 1 'psql -d ecb -c "SELECT * FROM userlist WHERE user_lastactivets IS NOT NULL ORDER BY user_lastactivets DESC"'

# To watch the pending queue to make sure nothing gets stuck while working out bugs
sudo -u ecb_user watch -n 1 'psql -d ecb -c "SELECT * FROM bsrpending ORDER BY bsr_ts ASC"'

# To watch the actual queue itself
sudo -u ecb_user watch -n 1 'psql -d ecb -c "SELECT oa,ob, oD::Numeric, bsr_code, bsr_req, bsr_req_here AS here, bsr_name, bsr_ts, bsr_length, bsr_note, sus_remap AS remap FROM bsractive ORDER BY oD ASC;"'
```

# File List
- eagles-chatbot-backend.service: To be placed in /lib/systemd/system/ to enable and start the systemd service for the backend.
- eagles-chatbot-frontend.service: To be placed in /lib/systemd/system/ to enable and start the systemd service for the frontend.
- eagles-chatbot-nginx: To be placed in /etc/nginx/sites-available/ to symlink to sites-enabled for nginx.
- setup_database.js: After the database itself is created and your .env file setup, this can be ran with node via commandline to create the tables and functions, and populate some basic values for functionality.

