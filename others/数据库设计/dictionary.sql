-- 职位翻译词表(id，职位中文名称，职位日文名称)
create table dictionary_positions (
	id int unsigned not null auto_increment,
	cn varchar(50) not null,
	jp varchar(50) not null,
	primary key (id)
);

insert into dictionary_positions (cn, jp) values ('其他', 'Other');

-- 人物/团体翻译词表(id，中文名称，日文名称)
create table dictionary_persons (
	id int unsigned not null auto_increment,
	cn varchar(50) not null,
	jp varchar(50) not null,
	primary key (id)
);