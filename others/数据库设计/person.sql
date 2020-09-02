-- 现实人物/团体条目档案(人物/团体条目档案_id, 人物/团体id, 中文名, 外文(原)名, 其他别名名单, 生日/成立日期, 
--                     故乡/所在地区, 人物/团体简介, 提交用户id, 提交时间, 提交说明, 审核员id, 审核时间, 审核说明, 状态)
create table person_records (
	-- id不能为0, 0作为未知或没有, id从1开始
	record_id int unsigned not null auto_increment,
  -- 新增条目时一开始entry_id为0, 审核通过后创建人物条目, 然后把person表里的entry_id返回给这个entry_id
  entry_id int unsigned not null default 0,
	-- type=1表示人物, type=2表示团体, type=3表示公司
	type_person tinyint(1) unsigned not null default 1,
  cover_url varchar(300) not null default '',
	chinese_name varchar(30) not null default '',
	foreign_name varchar(30) not null default '',
	-- 用'|'作分隔符, 格式示例：'毛泽东|毛主席|伟大的人民领袖'
	other_names varchar(300) not null default '',
	birthday varchar(10) not null default '',
	birthplace varchar(30) not null default '',
	intro varchar(1000) not null default '',
  members varchar(3000) not null default '',
	submitter_id int unsigned not null,
	submitted_at datetime not null default CURRENT_TIMESTAMP,
  submitter_message varchar(100) not null default '',
	auditor_id int unsigned not null default 0,
	audited_at datetime not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  auditor_message varchar(100) not null default '',
	status tinyint(1) not null default 1,
	created_at datetime not null default CURRENT_TIMESTAMP,
	updated_at datetime not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	primary key (record_id)
);

-- 公开现实人物/团体条目(人物/团体id, 中文名, 外文(原)名, 生日/成立日期, 故乡/所在地区, 人物/团体简介)
create table persons (
	-- id不能为0, 0作为未知或没有, id从1开始
	entry_id int unsigned not null auto_increment,
	-- type=1表示人物, type=2表示团体, type=3表示公司
	type_person tinyint(1) unsigned not null,
	chinese_name varchar(30) not null default '',
	foreign_name varchar(30) not null default '',
	birthday varchar(10) not null default '',
	birthplace varchar(30) not null default '',
	intro varchar(1000) not null default '',
	primary key (entry_id)
);

-- 现实人物/团体其他别名(人物/团体id, 其他别名)
create table person_other_names (
  entry_id int unsigned not null,
	other_name varchar(100) not null,
	primary key (entry_id, other_name)
);

-- 人物关系/团体成员表(主键id, 团体/公司id, 成员位置, 人物id, 人物名字)
create table person_members (
  id int unsigned not null auto_increment,
  entry_id int unsigned not null,
  position_name varchar(100) not null default '',
	person_id int unsigned not null default 0,
  person_name varchar(100) not null default '',
	primary key (id)
);