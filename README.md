# Thirdspace Api

Welcome to [Thirdspace]! This project is built with [Nodejs,Typescrict,Prisma and Postgres].

## Prerequisites

Before running the project, please make sure you have the following dependencies installed on your machine:

- Docker: [Link to Docker installation guide](https://docs.docker.com/get-docker/)
- Docker Compose: [Link to Docker Compose installation guide](https://docs.docker.com/compose/install/)

## Installation

To install the project and its dependencies, follow these steps:

1. Clone the repository:

2. Navigate to the project directory:

cd into your-project


3. Install the required packages using yarn:

yarn install


## Starting the Application

To start the application, follow these steps:

1. Run the following command to start the application using Docker Compose:

docker-compose up -d

yarn start

This command will start the necessary containers defined in the `docker-compose.yml` file.

2. Once the containers are up and running, you can access the application by visiting [http://localhost:your-port](http://localhost:your-port) in your web browser.


## Troubleshooting

If you encounter any issues while running the application, please try the following steps:

- Make sure you have Docker and Docker Compose installed correctly.
- Double-check that all the dependencies are installed by running `yarn install`.
- Ensure that the necessary ports are not being used by other applications.


## License

[MIT License]



