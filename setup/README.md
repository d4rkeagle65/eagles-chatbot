As I am still learning the development process with NodeJS and NextJS I have not gotten to the point of properly configuring an environment setup and I wanted to just dive into the code. 

The things in this folder are purely for assisting in setting up the environment so that this can be deployed onto a server.

# File List
- eagles-chatbot.service: To be placed in /lib/systemd/system/ to enable and start the systemd service for the backend.
- setup_database.js: After the database itself is created and your .env file setup, this can be ran with node via commandline to create the tables and functions, and populate some basic values for functionality.

