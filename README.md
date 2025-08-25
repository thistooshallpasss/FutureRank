# Smart Career Counselling & Prediction Portal

This project is a full-stack web application designed to assist students preparing for the Joint Entrance Examination (JEE) in India. It provides a suite of data-driven tools to predict their potential ranks and percentiles based on expected marks, offering valuable insights for their counselling and college selection process. The entire application is built with a scalable architecture, using a Node.js backend to serve a clean frontend that communicates with a powerful MySQL database.

## Features Implemented

- ✅ **Dynamic User Interface:** A clean dashboard with a two-column, responsive layout for predictor pages.
- ✅ **JEE Mains Rank Predictor:** Predicts General and Category rank ranges based on marks, category, gender, and PwD status.
- ✅ **JEE Advanced Rank Predictor:** Predicts General (CRL) and Category rank ranges, accounting for strict qualifying marks and PwD status.
- ✅ **JEE Mains Percentile Predictor:** Predicts percentile based on marks, session, and the specific difficulty of the exam shift.
- **Upcoming Features:**
  - 🔜 JEE Mains College Predictor
  - 🔜 JEE Advanced College Predictor
  - 🔜 Detailed College Information Portal

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Development:** Python (for data generation), `nodemon` (for live server reloading)

## Project Setup

To run this project locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone <your-repo-url>
    cd career-counselling-system
    ```

2.  **Install backend dependencies:**

    ```bash
    npm install
    ```

3.  **Database Setup:**

    - Ensure your MySQL server is running.
    - Create a database named `career_counselling_db`.
    - Create the three tables (`jee_mains_ranks`, `jee_advanced_ranks`, `jee_mains_percentile_data`) using the SQL schemas provided below.
    - Load the data from the generated `.csv` files into their respective tables using the `LOAD DATA INFILE` command.

4.  **Environment Variables:**

    - Create a file named `.env` in the root directory.
    - Add your database credentials and server port:
      ```
      DB_HOST=localhost
      DB_USER=your_mysql_username
      DB_PASSWORD=your_mysql_password
      DB_DATABASE=career_counselling_db
      PORT=3000
      ```

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.

## The Heart of the Project: The Data Generation Journey

![Dashboard](<Screenshot 2025-08-25 at 18.46.06.png>)
![Jee Mains](<Screenshot 2025-08-25 at 18.46.17.png>) ![Jee Score Prediction](<Screenshot 2025-08-25 at 18.46.38.png>) ![Jee Advanced Score Prediction](<Screenshot 2025-08-25 at 18.47.08.png>)

A core challenge of this project was the lack of clean, structured, and comprehensive public datasets. To overcome this, we adopted a **programmatic data generation** approach using Python, allowing us to create realistic and highly detailed datasets tailored to our specific needs.

### 1\. JEE Mains Rank Dataset

The model for predicting Mains rank evolved significantly:

- **Initial Model:** We started with a base exponential decay formula (`Rank = A * exp(-B * marks)`), where `A` represented the total number of candidates for a given year.
- **Adding Dimensions:** We layered in complexity by generating unique data points for every combination of `Category`, `Gender`, and `PWD_STATUS`.
- **From Value to Range:** To provide a more realistic prediction, single rank values were converted into rank ranges (`EXPECTED_..._MIN`, `EXPECTED_..._MAX`).
- **Logical Correction:** A critical flaw was identified where negative marks produced impossible ranks (e.g., 22 lakh). This was corrected by **capping** the maximum predicted rank at the total number of appeared candidates for that year, ensuring logical consistency.

### 2\. JEE Advanced Rank Dataset

The Advanced dataset required a more nuanced approach due to the exam's structure:

- **Strict Qualifying Marks:** The model's primary logic checks if a user's marks are above the official qualifying cutoff for their category. If not, the rank is returned as `0` (Not Qualified).
- **Hybrid Model:** A hybrid mathematical model was used:
  - A **linear interpolation model** for top-tier marks, anchored to the actual topper's score for that year (e.g., Rank 1 for 355/360 marks in 2024).
  - An **exponential decay model** for all other qualified scores.
- **Optimized Range:** Instead of generating data from 0 marks, the dataset starts from `(lowest_qualifying_mark - 20)`, creating a more focused and efficient dataset.

### 3\. JEE Mains Percentile Dataset

Percentile prediction is highly dependent on the relative difficulty of a student's specific exam shift.

- **Difficulty Factor:** For each of the 10 shifts per session, a unique `DIFFICULTY_FACTOR` was randomly generated (e.g., 1.05 for a tough shift, 0.95 for an easy one).
- **Sigmoid (Logistic) Function:** A baseline marks-vs-percentile curve was created using a logistic function. This function naturally produces the characteristic "S-curve" of percentile distribution.
- **Final Prediction:** The final percentile for a given mark is calculated by first adjusting the marks using the shift's `DIFFICULTY_FACTOR` and then feeding the result into the baseline logistic function.

## Database Schema

\<details\>
\<summary\>Click to view SQL Schemas\</summary\>

**Table: `jee_mains_ranks`**

```sql
CREATE TABLE jee_mains_ranks (
    YEAR SMALLINT UNSIGNED NOT NULL,
    MARKS_SCORED SMALLINT NOT NULL,
    CATEGORY VARCHAR(10) NOT NULL,
    GENDER CHAR(1) NOT NULL,
    PWD_STATUS VARCHAR(3) NOT NULL,
    EXPECTED_GENERAL_RANK_MIN INT UNSIGNED,
    EXPECTED_GENERAL_RANK_MAX INT UNSIGNED,
    EXPECTED_CATEGORY_RANK_MIN INT UNSIGNED,
    EXPECTED_CATEGORY_RANK_MAX INT UNSIGNED,
    PRIMARY KEY (YEAR, MARKS_SCORED, CATEGORY, GENDER, PWD_STATUS)
);
```

**Table: `jee_advanced_ranks`**

```sql
CREATE TABLE jee_advanced_ranks (
    YEAR SMALLINT UNSIGNED NOT NULL,
    MARKS_SCORED SMALLINT NOT NULL,
    CATEGORY VARCHAR(10) NOT NULL,
    GENDER CHAR(1) NOT NULL,
    PWD_STATUS VARCHAR(3) NOT NULL,
    EXPECTED_GENERAL_RANK_MIN INT UNSIGNED,
    EXPECTED_GENERAL_RANK_MAX INT UNSIGNED,
    EXPECTED_CATEGORY_RANK_MIN INT UNSIGNED,
    EXPECTED_CATEGORY_RANK_MAX INT UNSIGNED,
    PRIMARY KEY (YEAR, MARKS_SCORED, CATEGORY, GENDER, PWD_STATUS)
);
```

**Table: `jee_mains_percentile_data`**

```sql
CREATE TABLE jee_mains_percentile_data (
    YEAR SMALLINT NOT NULL,
    SESSION VARCHAR(10) NOT NULL,
    SHIFT TINYINT NOT NULL,
    MARKS_SCORED SMALLINT NOT NULL,
    DIFFICULTY_FACTOR DECIMAL(5, 4),
    EXPECTED_PERCENTILE DECIMAL(8, 4),
    PRIMARY KEY (YEAR, SESSION, SHIFT, MARKS_SCORED)
);
```

\</details\>

## API Endpoints

| Method | Endpoint                        | Description                                    |
| :----- | :------------------------------ | :--------------------------------------------- |
| `POST` | `/api/predict-mains-rank`       | Predicts JEE Mains rank based on inputs.       |
| `POST` | `/api/predict-advanced-rank`    | Predicts JEE Advanced rank based on inputs.    |
| `POST` | `/api/predict-mains-percentile` | Predicts JEE Mains percentile based on inputs. |
