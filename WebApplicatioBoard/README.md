# University Schedule System

A simple university management web application built with HTML, CSS, and vanilla JavaScript, hosted via ASP.NET, with localStorage used for client-side data storage.

## Features

### Users Management
- Add students and teachers
- Student fields:
    - Name, Surname, Patronymic
    - Group
    - FIN (must be unique)
- Teacher fields:
    - Name, Surname, Patronymic
    - Password

### Authentication
- Teacher login system
- Only logged-in teachers can add users
- Password validation is implemented

### Student Search
- Search by full name or FIN
- If input is empty, all students are displayed

### Schedule Management
- Add lessons with:
    - Day
    - Time (HH:mm)
    - Subject
    - Room
    - Group
    - Teacher

### Validation Rules
- FIN must be unique
- A teacher cannot:
    - Have two lessons at the same time
    - Have lessons with less than 1.5 hours difference

### Schedule Table
Displays:
- Day
- Time
- Subject
- Room
- Group
- Teacher name
- Number of students in the group

### Navigation
- Users page
- Schedule page
- Page 3 (placeholder)

## Data Storage

All data is stored in localStorage:
- students
- teachers
- schedule
- currentTeacherId

## Tech Stack
- HTML
- CSS
- JavaScript (Vanilla)
- ASP.NET (for hosting static files)

## Project Structure
wwwroot/
├── index.html
├── schedule.html
├── page3.html
├── script.js
├── data.js
├── style.css


## Purpose

This project simulates a basic university system:
- user management
- schedule management
- validation logic

It is designed for learning frontend development with ASP.NET hosting and without using external frameworks or backend databases.

## Author

Eteri Jafarova