CREATE DATABASE DisasterManagementSystem;

USE DisasterManagementSystem;

-- Table for Users
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15),
    role ENUM('User', 'Volunteer', 'Admin') NOT NULL
);

-- Table for Disasters
CREATE TABLE Disasters (
    disaster_id INT PRIMARY KEY AUTO_INCREMENT,
    disaster_type VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    severity_level INT NOT NULL,
    description TEXT,
    reported_by INT,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by) REFERENCES Users(user_id)
);

-- Table for Relief Camps
CREATE TABLE ReliefCamps (
    camp_id INT PRIMARY KEY AUTO_INCREMENT,
    camp_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    manager_id INT,
    FOREIGN KEY (manager_id) REFERENCES Users(user_id)
);

-- Table for Volunteers
CREATE TABLE Volunteers (
    volunteer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    camp_id INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    task_description TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (camp_id) REFERENCES ReliefCamps(camp_id)
);

-- Table for Donations
CREATE TABLE Donations (
    donation_id INT PRIMARY KEY AUTO_INCREMENT,
    donor_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES Users(user_id)
);

-- Table for SOS Alerts
CREATE TABLE SOSAlerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    disaster_id INT,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Resolved') DEFAULT 'Pending',
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (disaster_id) REFERENCES Disasters(disaster_id)
);
