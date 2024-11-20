CREATE DATABASE IF NOT EXISTS disastermanagementsystem;

USE disastermanagementsystem;

-- Table: disasters
CREATE TABLE disasters (
    disaster_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    disaster_type VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    severity_level INT NOT NULL,
    description TEXT DEFAULT NULL,
    reported_by INT DEFAULT NULL,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: donations
CREATE TABLE donations (
    donation_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    donor_id INT DEFAULT NULL,
    amount DECIMAL(10,2) NOT NULL,
    donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    disaster_id INT DEFAULT NULL
);

-- Table: ongoingdisasters
CREATE TABLE ongoingdisasters (
    ongoing_disaster_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    disaster_id INT NOT NULL,
    start_date DATE NOT NULL
);

-- Table: payments
CREATE TABLE payments (
    payment_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    payment_method ENUM('Credit Card','Debit Card','PayPal','Bank Transfer') NOT NULL
);

-- Table: profiles
CREATE TABLE profiles (
    profile_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    total_donations DECIMAL(10,2) DEFAULT 0.00,
    tasks_completed INT DEFAULT 0
);

-- Table: reliefcamps
CREATE TABLE reliefcamps (
    camp_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    camp_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    disaster_id INT DEFAULT NULL
);

-- Table: sosalerts
CREATE TABLE sosalerts (
    alert_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    disaster_id INT DEFAULT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('Pending','Resolved') DEFAULT 'Pending'
);

-- Table: users
CREATE TABLE users (
    user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(15) NOT NULL,
    country VARCHAR(50) NOT NULL,
    city VARCHAR(64) NOT NULL,
    password VARCHAR(100) NOT NULL,
    role ENUM('User','Volunteer','Admin') DEFAULT 'User' NOT NULL
);
