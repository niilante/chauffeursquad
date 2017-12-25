-- phpMyAdmin SQL Dump
-- version 4.7.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 29, 2017 at 01:54 PM
-- Server version: 10.1.16-MariaDB
-- PHP Version: 7.0.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
-- --------------------------------------------------------

--
-- Table structure for table `car`
--

CREATE TABLE `car` (
  `id` int(11) NOT NULL,
  `title` varchar(50) DEFAULT NULL,
  `image_address` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `complaint_type_driver`
--

CREATE TABLE `complaint_type_driver` (
  `id` int(11) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `importance` smallint(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `complaint_type_rider`
--

CREATE TABLE `complaint_type_rider` (
  `id` int(11) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `importance` smallint(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `driver`
--

CREATE TABLE `driver` (
  `id` int(11) NOT NULL,
  `fk_driver_type` int(11) DEFAULT NULL,
  `first_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_persian_ci DEFAULT NULL,
  `last_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_persian_ci DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `certificate_number` int(11) DEFAULT NULL,
  `mobile_number` bigint(10) DEFAULT NULL,
  `email` varchar(70) DEFAULT NULL,
  `credit` decimal(15,2) NOT NULL DEFAULT '0.00',
  `fk_car_id` int(11) DEFAULT NULL,
  `car_color` varchar(50) DEFAULT NULL,
  `car_production_year` smallint(6) DEFAULT NULL,
  `car_plate` varchar(10) DEFAULT NULL,
  `car_image` varchar(100) DEFAULT NULL,
  `lat` float(10,6) DEFAULT NULL,
  `lng` float(10,6) DEFAULT NULL,
  `status` enum('offline','online','in service') NOT NULL DEFAULT 'offline',
  `rating` float(3,2) DEFAULT NULL,
  `review_count` smallint(6) NOT NULL DEFAULT '0',
  `driver_image` varchar(50) DEFAULT NULL,
  `gender` enum('male','female') DEFAULT 'male',
  `registration_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `account_number` varchar(50) DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8 COLLATE utf8_persian_ci DEFAULT NULL,
  `info_changed` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `driver_review`
--

CREATE TABLE `driver_review` (
  `id` int(11) NOT NULL,
  `fk_rider` int(11) DEFAULT NULL,
  `fk_driver` int(11) DEFAULT NULL,
  `score` float(2,1) DEFAULT NULL,
  `review` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `driver_travel_type`
--

CREATE TABLE `driver_travel_type` (
  `id` int(11) NOT NULL,
  `fk_driver` int(11) DEFAULT NULL,
  `fk_travel_type` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `driver_type`
--

CREATE TABLE `driver_type` (
  `ID` int(11) NOT NULL,
  `title` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `operator`
--

CREATE TABLE `operator` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `image_address` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(20) DEFAULT NULL,
  `type` smallint(6) DEFAULT NULL,
  `mobile_number` bigint(11) DEFAULT NULL,
  `phone_number` bigint(11) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `access_base_types` tinyint(4) NOT NULL DEFAULT '1',
  `access_stats` tinyint(4) NOT NULL DEFAULT '1',
  `access_users` tinyint(4) NOT NULL DEFAULT '1',
  `access_drivers` tinyint(4) NOT NULL DEFAULT '3',
  `access_travels` tinyint(4) NOT NULL DEFAULT '0',
  `access_complaints` tinyint(4) NOT NULL DEFAULT '2',
  `access_call_requests` tinyint(4) NOT NULL DEFAULT '2',
  `access_payment_requests` tinyint(4) NOT NULL DEFAULT '2',
  `is_revoked` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `operator_reminder`
--

CREATE TABLE `operator_reminder` (
  `id` int(11) NOT NULL,
  `fk_operator` int(11) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `due` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `operator_todo`
--

CREATE TABLE `operator_todo` (
  `id` int(11) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `is_done` tinyint(1) DEFAULT NULL,
  `fk_operator` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `payment_request`
--

CREATE TABLE `payment_request` (
  `id` int(11) NOT NULL,
  `fK_driver` int(11) DEFAULT NULL,
  `request_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `paid_date` datetime DEFAULT NULL,
  `amount` float(10,2) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `status` enum('pending','paid','account_number_invalid') DEFAULT 'pending',
  `comment` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `rider`
--

CREATE TABLE `rider` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `mobile_number` bigint(10) DEFAULT NULL,
  `status` tinyint(4) DEFAULT NULL,
  `password` varchar(20) DEFAULT NULL,
  `register_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `birth_date` datetime DEFAULT NULL,
  `image_address` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `gender` enum('male','female') DEFAULT 'male',
  `referrer_id` int(11) DEFAULT NULL,
  `balance_amount` decimal(15,2) DEFAULT '0.00',
  `address` varchar(250) DEFAULT NULL,
  `info_changed` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `travel`
--

CREATE TABLE `travel` (
  `id` int(11) NOT NULL,
  `fk_driver` int(11) DEFAULT NULL,
  `fk_rider` int(11) DEFAULT NULL,
  `status` enum('requested','not found','no close found','found','driver accepted','rider accepted','driver canceled','rider canceled','travel started','travel finished') DEFAULT 'requested',
  `origin` varchar(200) NOT NULL,
  `destination` varchar(200) NOT NULL,
  `from_lat` float(10,6) NOT NULL,
  `from_lng` float(10,6) NOT NULL,
  `to_lat` float(10,6) NOT NULL,
  `to_lng` float(10,6) NOT NULL,
  `distance_best` int(11) NOT NULL DEFAULT 0,
  `duration_best` int(11) NOT NULL DEFAULT 0,
  `travel_duration` int(11) NOT NULL DEFAULT 0,
  `travel_distance` int(11) NOT NULL DEFAULT 0,
  `request_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `fk_travel_type` int(11) DEFAULT NULL,
  `cost` float DEFAULT '0',
  `rating` int(11) DEFAULT NULL,
  `bill_type` int(11) DEFAULT NULL,
  `travel_start` datetime DEFAULT NULL,
  `log` varchar(10000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `travel_complaint`
--

CREATE TABLE `travel_complaint` (
  `id` int(11) NOT NULL,
  `fk_travel_id` int(11) DEFAULT NULL,
  `fk_complaint_type_driver_id` int(11) DEFAULT NULL,
  `fk_complaint_type_rider_id` int(11) DEFAULT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `content` varchar(200) DEFAULT NULL,
  `is_reviewed` tinyint(1) NOT NULL DEFAULT '0',
  `time_inscription` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `time_review` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `travel_type`
--

CREATE TABLE `travel_type` (
  `id` int(11) NOT NULL,
  `fk_driver_type_id` int(11) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `initial` float(6,2) DEFAULT NULL,
  `every_km` float(6,2) DEFAULT NULL,
  `every_minute_gone` float(6,2) DEFAULT NULL,
  `every_minute_wait` float(6,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `car`
--
ALTER TABLE `car`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `complaint_type_driver`
--
ALTER TABLE `complaint_type_driver`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `complaint_type_rider`
--
ALTER TABLE `complaint_type_rider`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `driver`
--
ALTER TABLE `driver`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_car_id` (`fk_car_id`),
  ADD KEY `fk_driver_type` (`fk_driver_type`);

--
-- Indexes for table `driver_review`
--
ALTER TABLE `driver_review`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_passenger` (`fk_rider`),
  ADD KEY `fk_driver` (`fk_driver`);

--
-- Indexes for table `driver_travel_type`
--
ALTER TABLE `driver_travel_type`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_driver` (`fk_driver`),
  ADD KEY `fk_travel_type` (`fk_travel_type`);

--
-- Indexes for table `driver_type`
--
ALTER TABLE `driver_type`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `operator`
--
ALTER TABLE `operator`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `operator_reminder`
--
ALTER TABLE `operator_reminder`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_operator` (`fk_operator`);

--
-- Indexes for table `operator_todo`
--
ALTER TABLE `operator_todo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_operator` (`fk_operator`);

--
-- Indexes for table `payment_request`
--
ALTER TABLE `payment_request`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fK_driver` (`fK_driver`);

--
-- Indexes for table `rider`
--
ALTER TABLE `rider`
  ADD PRIMARY KEY (`id`),
  ADD KEY `referrer_id` (`referrer_id`);

--
-- Indexes for table `travel`
--
ALTER TABLE `travel`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_DRIVER_ID` (`fk_driver`),
  ADD KEY `FK_CUSTOMER_ID` (`fk_rider`),
  ADD KEY `travel_type` (`fk_travel_type`);

--
-- Indexes for table `travel_complaint`
--
ALTER TABLE `travel_complaint`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_travel_id` (`fk_travel_id`),
  ADD KEY `fk_complaint_type_driver` (`fk_complaint_type_driver_id`),
  ADD KEY `fk_complaint_type_passenger` (`fk_complaint_type_rider_id`);

--
-- Indexes for table `travel_type`
--
ALTER TABLE `travel_type`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_driver_type_id` (`fk_driver_type_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `car`
--
ALTER TABLE `car`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `complaint_type_driver`
--
ALTER TABLE `complaint_type_driver`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `complaint_type_rider`
--
ALTER TABLE `complaint_type_rider`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `driver`
--
ALTER TABLE `driver`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT for table `driver_review`
--
ALTER TABLE `driver_review`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
--
-- AUTO_INCREMENT for table `driver_travel_type`
--
ALTER TABLE `driver_travel_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `driver_type`
--
ALTER TABLE `driver_type`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `operator`
--
ALTER TABLE `operator`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `operator_reminder`
--
ALTER TABLE `operator_reminder`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
--
-- AUTO_INCREMENT for table `operator_todo`
--
ALTER TABLE `operator_todo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `payment_request`
--
ALTER TABLE `payment_request`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
--
-- AUTO_INCREMENT for table `rider`
--
ALTER TABLE `rider`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `travel`
--
ALTER TABLE `travel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=231;
--
-- AUTO_INCREMENT for table `travel_complaint`
--
ALTER TABLE `travel_complaint`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
--
-- AUTO_INCREMENT for table `travel_type`
--
ALTER TABLE `travel_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `driver`
--
ALTER TABLE `driver`
  ADD CONSTRAINT `driver_ibfk_1` FOREIGN KEY (`fk_car_id`) REFERENCES `car` (`ID`),
  ADD CONSTRAINT `driver_ibfk_2` FOREIGN KEY (`fk_driver_type`) REFERENCES `driver_type` (`ID`);

--
-- Constraints for table `driver_review`
--
ALTER TABLE `driver_review`
  ADD CONSTRAINT `driver_review_ibfk_1` FOREIGN KEY (`fk_rider`) REFERENCES `rider` (`id`),
  ADD CONSTRAINT `driver_review_ibfk_2` FOREIGN KEY (`fk_driver`) REFERENCES `driver` (`id`);

--
-- Constraints for table `driver_travel_type`
--
ALTER TABLE `driver_travel_type`
  ADD CONSTRAINT `driver_travel_type_ibfk_1` FOREIGN KEY (`fk_driver`) REFERENCES `driver` (`id`),
  ADD CONSTRAINT `driver_travel_type_ibfk_2` FOREIGN KEY (`fk_travel_type`) REFERENCES `travel_type` (`ID`);

--
-- Constraints for table `operator_reminder`
--
ALTER TABLE `operator_reminder`
  ADD CONSTRAINT `operator_reminder_ibfk_1` FOREIGN KEY (`fk_operator`) REFERENCES `operator` (`ID`);

--
-- Constraints for table `operator_todo`
--
ALTER TABLE `operator_todo`
  ADD CONSTRAINT `operator_todo_ibfk_1` FOREIGN KEY (`fk_operator`) REFERENCES `operator` (`ID`);

--
-- Constraints for table `payment_request`
--
ALTER TABLE `payment_request`
  ADD CONSTRAINT `payment_request_ibfk_1` FOREIGN KEY (`fK_driver`) REFERENCES `driver` (`id`);

--
-- Constraints for table `rider`
--
ALTER TABLE `rider`
  ADD CONSTRAINT `rider_ibfk_1` FOREIGN KEY (`referrer_id`) REFERENCES `rider` (`id`);

--
-- Constraints for table `travel`
--
ALTER TABLE `travel`
  ADD CONSTRAINT `travel_ibfk_1` FOREIGN KEY (`fk_travel_type`) REFERENCES `travel_type` (`ID`);

--
-- Constraints for table `travel_complaint`
--
ALTER TABLE `travel_complaint`
  ADD CONSTRAINT `fk_complaint_type_driver` FOREIGN KEY (`fk_complaint_type_driver_id`) REFERENCES `complaint_type_driver` (`id`),
  ADD CONSTRAINT `fk_complaint_type_passenger` FOREIGN KEY (`fk_complaint_type_rider_id`) REFERENCES `complaint_type_rider` (`id`),
  ADD CONSTRAINT `travel_complaint_ibfk_1` FOREIGN KEY (`fk_travel_id`) REFERENCES `travel` (`id`);

--
-- Constraints for table `travel_type`
--
ALTER TABLE `travel_type`
  ADD CONSTRAINT `travel_type_ibfk_1` FOREIGN KEY (`fk_driver_type_id`) REFERENCES `driver_type` (`ID`);
  INSERT INTO operator (first_name,last_name,email,password,access_users) VALUES ('JOHN','DOE','admin','admin',3);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
