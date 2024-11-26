#!/bin/bash

# this script runs first time when container is created
echo "running postCreateCommand.sh"

# store current pwd into a variable
current_pwd=$(pwd)
cd /usr/src/project

# if /usr/src/project/app-main/node_modules then echo "installing npm packages"
# if /usr/src/project/app-main/node_modules then echo "installing npm packages"
if [ -d "/usr/src/project/app-main/node_modules" ]; then
  echo "installing npm packages"
else
  echo "node_modules folder not found, installing npm packages"
  cd /usr/src/project/app-main
  npm install
  cd /usr/src/project
fi

# if /usr/src/project/app-main/.env.local and NGROK_AUTHTOKEN from /usr/src/project/app-main/.env.local exists then run
if [ -f "/usr/src/project/app-main/.env.local" ]; then
  NGROK_AUTHTOKEN=$(grep -oP '^DEVCONTAINER_NGROK_AUTHTOKEN=\K.*' /usr/src/project/app-main/.env.local)
  if [ -n "$NGROK_AUTHTOKEN" ]; then
    ngrok config add-authtoken "$NGROK_AUTHTOKEN"
  else
    echo "NGROK_AUTHTOKEN not found in .env.local"
  fi
else
  echo ".env.local file not found"
fi




# Check if /usr/src/project/.git is a valid git repository
if [ -d "/usr/src/project/.git" ]; then
    # Set git to ignore file mode (permissions) changes in this repository
    git --git-dir=/usr/src/project/.git config core.fileMode false
else
    echo "Error: /usr/src/project/.git is not a valid git repository."
fi

# Set git to ignore file mode (permissions) changes globally for all repositories
git config --global core.fileMode false

echo "Enter your username:"
read username
case $username in
    vicre)
        git config --global user.email "vicre@dtu.dk"
        git config --global user.name "Victor Reipur"
        ;;
    *)
        echo "Enter your email:"
        read email
        git config --global user.email "$email"
        echo "Enter your name:"
        read name
        git config --global user.name "$name"
        ;;
esac
# git config --global --add safe.directory /usr/src/project
# git config --global --add safe.directory /mnt/project
# git config --global --add safe.directory /usr/src/project/.devcontainer/.docker-migrate
# git config --global --add safe.directory /usr/src/project/.devcontainer/.docker-image-builder
git config pull.rebase true

# show current pip freeze
echo "Show current pip freeze into requirements.txt"
/usr/src/venvs/app-main/bin/pip freeze > /usr/src/project/app-main/requirements.txt

echo "Getting git submodules"
git submodule init && git submodule update

echo "Ending postCreateCommand.sh"

# restore the pwd
cd $current_pwd
