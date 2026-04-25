-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 22, 2026 at 01:34 PM
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
-- Database: `pvp`
--

-- --------------------------------------------------------

--
-- Table structure for table `imones`
--

CREATE TABLE `imones` (
  `pavadinimas` varchar(255) DEFAULT NULL,
  `miestas` varchar(255) DEFAULT NULL,
  `pasto_kodas` varchar(255) DEFAULT NULL,
  `adresas` varchar(255) DEFAULT NULL,
  `pastato_nr` varchar(255) DEFAULT NULL,
  `tel_nr` varchar(255) DEFAULT NULL,
  `imones_kodas` varchar(255) DEFAULT NULL,
  `pvm_kodas` varchar(255) DEFAULT NULL,
  `svetaine` varchar(255) DEFAULT NULL,
  `id_Imone` int(11) NOT NULL,
  `fk_Vartotojasid_Vartotojas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `megstamiausi`
--

CREATE TABLE `megstamiausi` (
  `id_Megstamas` int(11) NOT NULL,
  `fk_Skelbimasid_Skelbimas` int(11) NOT NULL,
  `fk_Vartotojasid_Vartotojas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `modeliai`
--

CREATE TABLE `modeliai` (
  `pavadinimas` varchar(255) DEFAULT NULL,
  `aprasymas` varchar(255) DEFAULT NULL,
  `informacija` varchar(255) DEFAULT NULL,
  `sukurta` date DEFAULT NULL,
  `redaguota` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_Modelis` int(11) NOT NULL,
  `fk_Vartotojasid_Vartotojas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nuotraukos`
--

CREATE TABLE `nuotraukos` (
  `ref` mediumblob DEFAULT NULL,
  `id_Nuotrauka` int(11) NOT NULL,
  `fk_Skelbimasid_Skelbimas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pokalbiai`
--

CREATE TABLE `pokalbiai` (
  `id_Pokalbis` int(11) NOT NULL,
  `fk_Vartotojasid_Vartotojas` int(11) NOT NULL,
  `fk_Skelbimasid_Skelbimas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pristatymai`
--

CREATE TABLE `pristatymai` (
  `pavadinimas` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pristatymai`
--

INSERT INTO `pristatymai` (`pavadinimas`) VALUES
('abu'),
('atsiimti_patiems'),
('tik_siuntimas');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `pavadinimas` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`pavadinimas`) VALUES
('administratorius'),
('atstovas'),
('vartotojas');

-- --------------------------------------------------------

--
-- Table structure for table `skelbimai`
--

CREATE TABLE `skelbimai` (
  `pavadinimas` varchar(255) NOT NULL,
  `aprasymas` text DEFAULT NULL,
  `kaina` decimal(10,2) DEFAULT NULL,
  `min_kiekis` int(11) DEFAULT NULL,
  `vieta` varchar(255) DEFAULT NULL,
  `data` date DEFAULT NULL,
  `amzius` int(11) DEFAULT NULL,
  `aukstis` int(11) DEFAULT NULL,
  `plotis` int(11) DEFAULT NULL,
  `lotyniskas_pav` varchar(255) DEFAULT NULL,
  `tipas` varchar(255) DEFAULT NULL,
  `kilme` varchar(255) DEFAULT NULL,
  `atstumas` int(11) DEFAULT NULL,
  `pristatymo_budas` char(16) DEFAULT NULL,
  `statusas` char(9) DEFAULT NULL,
  `id_Skelbimas` int(11) NOT NULL,
  `fk_Imoneid_Imone` int(11) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `skelbimo_statusai`
--

CREATE TABLE `skelbimo_statusai` (
  `pavadinimas` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `skelbimo_statusai`
--

INSERT INTO `skelbimo_statusai` (`pavadinimas`) VALUES
('aktyvus'),
('neaktyvus');

-- --------------------------------------------------------

--
-- Table structure for table `statusai`
--

CREATE TABLE `statusai` (
  `pavadinimas` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `statusai`
--

INSERT INTO `statusai` (`pavadinimas`) VALUES
('aktyvus'),
('laukia_patvirtinimo'),
('sustabdytas');

-- --------------------------------------------------------

--
-- Table structure for table `vartotojai`
--

CREATE TABLE `vartotojai` (
  `vardas` varchar(255) NOT NULL,
  `pavarde` varchar(255) NOT NULL,
  `e_pastas` varchar(255) NOT NULL,
  `slapyvardis` varchar(255) NOT NULL,
  `slaptazodis` varchar(255) NOT NULL,
  `tel_nr` varchar(255) DEFAULT NULL,
  `miestas` varchar(255) DEFAULT NULL,
  `role` char(17) DEFAULT 'vartotojas',
  `busena` char(30) DEFAULT 'aktyvus',
  `id_Vartotojas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `zinutes`
--

CREATE TABLE `zinutes` (
  `tekstas` varchar(255) DEFAULT NULL,
  `data` datetime(3) DEFAULT NULL,
  `busena` char(17) DEFAULT NULL,
  `id_Zinute` int(11) NOT NULL,
  `fk_Vartotojasid_Vartotojas` int(11) NOT NULL,
  `fk_Pokalbisid_Pokalbis` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `zinutes_busenos`
--

CREATE TABLE `zinutes_busenos` (
  `pavadinimas` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `zinutes_busenos`
--

INSERT INTO `zinutes_busenos` (`pavadinimas`) VALUES
('issiusta'),
('klaida'),
('perskaityta'),
('siunciama');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `imones`
--
ALTER TABLE `imones`
  ADD PRIMARY KEY (`id_Imone`),
  ADD UNIQUE KEY `fk_Vartotojasid_Vartotojas` (`fk_Vartotojasid_Vartotojas`);

--
-- Indexes for table `megstamiausi`
--
ALTER TABLE `megstamiausi`
  ADD PRIMARY KEY (`id_Megstamas`),
  ADD KEY `fk_Skelbimasid_Skelbimas` (`fk_Skelbimasid_Skelbimas`),
  ADD KEY `fk_Vartotojasid_Vartotojas` (`fk_Vartotojasid_Vartotojas`);

--
-- Indexes for table `modeliai`
--
ALTER TABLE `modeliai`
  ADD PRIMARY KEY (`id_Modelis`),
  ADD KEY `fk_Vartotojasid_Vartotojas` (`fk_Vartotojasid_Vartotojas`);

--
-- Indexes for table `nuotraukos`
--
ALTER TABLE `nuotraukos`
  ADD PRIMARY KEY (`id_Nuotrauka`),
  ADD KEY `fk_Skelbimasid_Skelbimas` (`fk_Skelbimasid_Skelbimas`);

--
-- Indexes for table `pokalbiai`
--
ALTER TABLE `pokalbiai`
  ADD PRIMARY KEY (`id_Pokalbis`),
  ADD KEY `fk_Vartotojasid_Vartotojas1` (`fk_Vartotojasid_Vartotojas`),
  ADD KEY `fk_Skelbimasid_Skelbimas` (`fk_Skelbimasid_Skelbimas`);

--
-- Indexes for table `pristatymai`
--
ALTER TABLE `pristatymai`
  ADD PRIMARY KEY (`pavadinimas`),
  ADD UNIQUE KEY `pavadinimas` (`pavadinimas`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`pavadinimas`),
  ADD UNIQUE KEY `pavadinimas` (`pavadinimas`);

--
-- Indexes for table `skelbimai`
--
ALTER TABLE `skelbimai`
  ADD PRIMARY KEY (`id_Skelbimas`),
  ADD KEY `fk_Imoneid_Imone` (`fk_Imoneid_Imone`),
  ADD KEY `fk_skelbimo_pristatymas` (`pristatymo_budas`),
  ADD KEY `fk_skelbimo_statusas` (`statusas`);

--
-- Indexes for table `skelbimo_statusai`
--
ALTER TABLE `skelbimo_statusai`
  ADD PRIMARY KEY (`pavadinimas`),
  ADD UNIQUE KEY `pavadinimas` (`pavadinimas`);

--
-- Indexes for table `statusai`
--
ALTER TABLE `statusai`
  ADD PRIMARY KEY (`pavadinimas`),
  ADD UNIQUE KEY `pavadinimas` (`pavadinimas`);

--
-- Indexes for table `vartotojai`
--
ALTER TABLE `vartotojai`
  ADD PRIMARY KEY (`id_Vartotojas`),
  ADD KEY `fk_vartotojo_role` (`role`),
  ADD KEY `fk_vartotojo_busena` (`busena`);

--
-- Indexes for table `zinutes`
--
ALTER TABLE `zinutes`
  ADD PRIMARY KEY (`id_Zinute`),
  ADD KEY `fk_Vartotojasid_Vartotojas` (`fk_Vartotojasid_Vartotojas`),
  ADD KEY `fk_Pokalbisid_Pokalbis` (`fk_Pokalbisid_Pokalbis`),
  ADD KEY `fk_zinutes_busena` (`busena`);

--
-- Indexes for table `zinutes_busenos`
--
ALTER TABLE `zinutes_busenos`
  ADD PRIMARY KEY (`pavadinimas`),
  ADD UNIQUE KEY `pavadinimas` (`pavadinimas`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `imones`
--
ALTER TABLE `imones`
  MODIFY `id_Imone` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `megstamiausi`
--
ALTER TABLE `megstamiausi`
  MODIFY `id_Megstamas` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `modeliai`
--
ALTER TABLE `modeliai`
  MODIFY `id_Modelis` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nuotraukos`
--
ALTER TABLE `nuotraukos`
  MODIFY `id_Nuotrauka` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `pokalbiai`
--
ALTER TABLE `pokalbiai`
  MODIFY `id_Pokalbis` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `skelbimai`
--
ALTER TABLE `skelbimai`
  MODIFY `id_Skelbimas` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vartotojai`
--
ALTER TABLE `vartotojai`
  MODIFY `id_Vartotojas` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `zinutes`
--
ALTER TABLE `zinutes`
  MODIFY `id_Zinute` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=418;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `imones`
--
ALTER TABLE `imones`
  ADD CONSTRAINT `imones_ibfk_1` FOREIGN KEY (`fk_Vartotojasid_Vartotojas`) REFERENCES `vartotojai` (`id_Vartotojas`);

--
-- Constraints for table `megstamiausi`
--
ALTER TABLE `megstamiausi`
  ADD CONSTRAINT `megstamiausi_ibfk_1` FOREIGN KEY (`fk_Skelbimasid_Skelbimas`) REFERENCES `skelbimai` (`id_Skelbimas`),
  ADD CONSTRAINT `megstamiausi_ibfk_2` FOREIGN KEY (`fk_Vartotojasid_Vartotojas`) REFERENCES `vartotojai` (`id_Vartotojas`);

--
-- Constraints for table `modeliai`
--
ALTER TABLE `modeliai`
  ADD CONSTRAINT `modeliai_ibfk_1` FOREIGN KEY (`fk_Vartotojasid_Vartotojas`) REFERENCES `vartotojai` (`id_Vartotojas`);

--
-- Constraints for table `nuotraukos`
--
ALTER TABLE `nuotraukos`
  ADD CONSTRAINT `nuotraukos_ibfk_1` FOREIGN KEY (`fk_Skelbimasid_Skelbimas`) REFERENCES `skelbimai` (`id_Skelbimas`);

--
-- Constraints for table `pokalbiai`
--
ALTER TABLE `pokalbiai`
  ADD CONSTRAINT `pokalbiai_ibfk_1` FOREIGN KEY (`fk_Vartotojasid_Vartotojas`) REFERENCES `vartotojai` (`id_Vartotojas`),
  ADD CONSTRAINT `pokalbiai_ibfk_3` FOREIGN KEY (`fk_Skelbimasid_Skelbimas`) REFERENCES `skelbimai` (`id_Skelbimas`);

--
-- Constraints for table `skelbimai`
--
ALTER TABLE `skelbimai`
  ADD CONSTRAINT `fk_skelbimo_pristatymas` FOREIGN KEY (`pristatymo_budas`) REFERENCES `pristatymai` (`pavadinimas`),
  ADD CONSTRAINT `fk_skelbimo_statusas` FOREIGN KEY (`statusas`) REFERENCES `skelbimo_statusai` (`pavadinimas`),
  ADD CONSTRAINT `skelbimai_ibfk_1` FOREIGN KEY (`fk_Imoneid_Imone`) REFERENCES `imones` (`id_Imone`);

--
-- Constraints for table `vartotojai`
--
ALTER TABLE `vartotojai`
  ADD CONSTRAINT `fk_vartotojo_busena` FOREIGN KEY (`busena`) REFERENCES `statusai` (`pavadinimas`),
  ADD CONSTRAINT `fk_vartotojo_role` FOREIGN KEY (`role`) REFERENCES `roles` (`pavadinimas`);

--
-- Constraints for table `zinutes`
--
ALTER TABLE `zinutes`
  ADD CONSTRAINT `fk_zinutes_busena` FOREIGN KEY (`busena`) REFERENCES `zinutes_busenos` (`pavadinimas`),
  ADD CONSTRAINT `zinutes_ibfk_1` FOREIGN KEY (`fk_Vartotojasid_Vartotojas`) REFERENCES `vartotojai` (`id_Vartotojas`),
  ADD CONSTRAINT `zinutes_ibfk_2` FOREIGN KEY (`fk_Pokalbisid_Pokalbis`) REFERENCES `pokalbiai` (`id_Pokalbis`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
