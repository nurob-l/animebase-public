-- 动画角色条目审核(动画角色条目版本_id, 角色id, 中文名, 外文(原)名, 生日设定, 提交用户id, 提交时间, 提交说明, 审核员id, 审核时间, 审核说明, 状态)
create table character_records (
	-- id不能为0, 0作为未知或没有, id从1开始
	record_id int unsigned not null auto_increment,
  -- 新增条目时一开始entry_id为0, 审核通过后创建角色条目, 然后把characters表里的entry_id返回给这个entry_id
  entry_id int unsigned not null default 0,
  cover_url varchar(300) not null default '',
	chinese_name varchar(100) not null default '',
	foreign_name varchar(100) not null default '',
	-- 用'|'作分隔符, 格式示例：'a|b|c'
	other_names varchar(300) not null default '',
	birthday date not null default '1000-01-01',
	submitter_id int unsigned not null,
	submitted_at datetime not null default CURRENT_TIMESTAMP,
  submitter_message varchar(100) not null default '',
	auditor_id int unsigned not null default 0,
	audited_at datetime not null default CURRENT_TIMESTAMP,
  auditor_message varchar(100) not null default '',
	status tinyint(1) not null default 1,
	primary key (record_id)
);

-- 动画角色(角色id, 中文名, 外文(原)名, 生日设定)
create table characters (
	-- id不能为0, 0作为未知或没有, id从1开始
	entry_id int unsigned not null auto_increment,
	chinese_name varchar(100) not null default '',
	foreign_name varchar(100) not null default '',
	birthday date not null default '1000-01-01',
	primary key (entry_id)
);

-- 动画角色其他别名(角色id, 其他别名)
create table character_other_names (
  entry_id int unsigned not null,
	other_name varchar(100) not null,
	primary key (entry_id, other_name)
);