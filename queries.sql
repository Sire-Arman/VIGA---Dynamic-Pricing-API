-- Organisation Table
create table Organisation(
	id serial primary key,
	name varchar(150) not null unique
);

-- Item Table
create table Item(
	id serial primary key,
	type varchar(100) not null,
	description text
);
-- Pricing Table
create table Pricing(
	organization_id integer not null references Organisation(id),
	item_id integer not null references Item(id),
	primary key (organization_id, item_id),
	zone varchar(100) ,
	base_distance_in_km decimal(3,1),
	check( base_distance_in_km >=1),
	km_price decimal(6,2),
	fix_price decimal(7,2)
);

