# **Movie Database CRUD App**

## **Overview**

This project is a CRUD (Create, Read, Update, Delete) application that interacts with the **TMDB API** (The Movie Database API). The application performs various operations on movies data such as listing, searching, rating, adding to a watchlist, and filtering by genre. It utilizes **NestJS** for the backend and **Prisma** for the database layer.

## **Features**

- **CRUD Operations:** Read and Update movie data from the TMDB API.
- **Movie Ratings:** Users can rate movies, and the system calculates the average rating for each movie.
- **Watchlist/Favorites:** Users can add movies to their watchlist or mark them as favorites.
- **Genre Filtering:** Filter movies by genre such as Action, Thriller, Horror, etc.
- **Pagination and Searching:** Provides pagination support for movie listings and searching by movie titles.
- **API Documentation:** Automatically generated API documentation using Swagger.

## **Tech Stack**

- **Backend Framework:** NestJS
- **Database ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT (optional for securing APIs)
- **Testing:** Jest
- **Containerization:** Docker

## **Setup**

### **Prerequisites**

Before starting, ensure you have the following installed:

- **Node.js** (>= 18.x)
- **Docker** and **Docker Compose** (for containerization)
- **PostgreSQL** (or any other relational database)
- **TMDB API Key**: You can sign up on [TMDB](https://www.themoviedb.org/) to get your API key.

### **Step 1: Clone the Repository**

Clone this repository to your local machine:

```bash
git clone https://github.com/yourusername/movie-database-crud-app.git
cd movie-database-crud-app
```

### **Step 2: Install Dependencies**

To install the necessary dependencies for the project, run the following command:

```bash
npm install
```

### **Step 3: Configure Environment Variables**

Create a .env file in the root directory of the project by copying the example file:

```bash
cp .env.example .env
```

Then, edit the .env file with your TMDB API key and database connection information

````bash
POSTGRES_USER=admin
POSTGRES_PASSWORD=adminpass
POSTGRES_DB=movies

# nest run in docker container
#DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public
# nest run locally
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/movies?schema=public"

REDIS_HOST=redis
REDIS_PORT=6380

USER_JWT_SECRET="PXDUVP1xcG0JEdr8Z04YCPDnxOY3j07EYTY5iYwKD8Qr7jwD7XW+bUcunbjsFhjiYINzZLhctJP5XZORESPWdZZT/0BypWW6CDWIuxkCOvrTc6dYQkk5eDowqMAyMYHzkwfSTMyniL39NYM7oDUUY06W+GVDUrE9WJy3xVehC0Nbx5uzbH6UcooM+XzOexSlfGQrFoYdrwOslPo0nuuPJg7096peVWB3WJPQiwSEDIUVUBsZujPS/rwirgsnut8vzIuvsLReK/ZHn5B1nS5G/j18jeNDvzwoG8ujzBnWVhVhEOrLeWOgfxFJWDMgX8jaq/5VgXlC6Lze+8vPnIdUjA=="
USER_JWT_EXPIRY=3600

TMDB_API_URL="https://api.themoviedb.org/3"
TMDB_API_KEY="eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2Yzc1MDJkMmE3NzRiNjEzNWMyNTE3MGI3NjM4MGEzZiIsIm5iZiI6MTczMzk1MDE3My4yNjIsInN1YiI6IjY3NTlmYWRkZGQ1YTMwYzQyZGFmMWVlNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.crD09JqiEXqsZpo9riRWrKdQPJ9xOQPCbo01oocTkDU"```
````

### **Step 3: Step 4: Prisma Migrations**

Generate the database schema with Prisma:

```bash
npx prisma migrate dev
```

### **Step 5: Step 4: Running the Application**

Local Development
To run the app in development mode, use the following command

```bash
npm run start:dev
```

Docker Setup
Alternatively, you can use Docker to run the application. Build and run the containers using

```bash
docker-compose up --build
```

The app will be available at http://localhost:8080/tmdb/docs.
