DROP TABLE IF EXISTS houses;

CREATE TABLE IF NOT EXISTS `property`(
    `url` VARCHAR(200) NOT NULL,
    `location_country` VARCHAR(50) NOT NULL,
    `location_city` VARCHAR(50) NOT NULL,
    `location_address` VARCHAR(200),
    `location_coordinates_lat` DECIMAL(8, 6),
    `location_coordinates_lng` DECIMAL(8, 6),
    `size_parcelm2` DECIMAL(8, 6),
    `size_grossm2`DECIMAL(8, 6),
    `size_netm2` DECIMAL(8, 6),
    `size_rooms` DECIMAL(8, 6) NOT NULL,
    `price_value` DECIMAL(8, 6) NOT NULL,
    `price_currency` VARCHAR(3) NOT NULL,
    `description` TEXT,
    `title` VARCHAR(100),
    `images` TEXT,
    PRIMARY KEY (url)

)
