-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 01, 2024 at 06:05 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `website_monitor`
--

-- --------------------------------------------------------

--
-- Table structure for table `websites`
--

CREATE TABLE `websites` (
  `id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL,
  `lastChecked` datetime NOT NULL,
  `httpStatusCode` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `websites`
--

INSERT INTO `websites` (`id`, `url`, `status`, `lastChecked`, `httpStatusCode`) VALUES
(1, 'http://googl.com', 'Up', '2024-10-31 14:48:06', 0),
(2, 'https://www.youtube.com/', '200', '2024-10-31 14:01:53', 0),
(4, 'https://www.nykaa.com/', 'Down', '2024-10-31 14:04:49', 0),
(5, 'https://www.facebook.com/', '200', '2024-10-31 14:05:53', 0),
(6, 'https://www.instagram.com/', '200', '2024-10-31 14:06:16', 0),
(7, 'https://www.amazon.com/', '200', '2024-10-31 14:07:01', 0),
(8, 'https://www.flipkart.com/', 'Down', '2024-10-31 14:07:29', 0),
(9, 'https://www.alibaba.com/', '200', '2024-10-31 14:08:02', 0),
(10, 'https://www.setubridge.com/', '200', '2024-10-31 14:09:43', 0),
(11, 'https://map.com', '200', '2024-10-31 15:07:24', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `websites`
--
ALTER TABLE `websites`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `websites`
--
ALTER TABLE `websites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
