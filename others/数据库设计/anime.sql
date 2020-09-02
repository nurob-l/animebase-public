-- 动画条目档案(动画条目档案id, 动画id, 动画中文名, 动画外文(原)名, 动画其他别名名单, 传播类型, 改编类型, 制片国家/地区名单, 放送/上映日期列表, 
--             国内网络播放版权名单, 动画简介, 制作人员表, 配音演员阵容表, 提交用户id, 提交时间, 提交说明, 审核员id, 审核时间, 审核说明, 状态)
create table anime_records (
	-- id不能为0, 0作为未知或没有, id从1开始
	record_id int unsigned not null auto_increment,
  -- 新增条目时一开始entry_id为0, 审核通过后创建动画条目, 然后把animes表里的entry_id返回给这个entry_id
  entry_id int unsigned not null default 0,
  cover_url varchar(300) not null default '',
	chinese_name varchar(100) not null default '',
	foreign_name varchar(100) not null default '',
	-- 用'|'作分隔符, 格式示例：'fate stay night|fsn|菲特今晚留下来'
	other_names varchar(500) not null default '',
	-- type_medium, 1='Others', 2='TV', 3='Web', 4='电影', 5='OVA', 6='OAD'
	type_medium tinyint unsigned not null default 1,
	-- type_source, 1='其他改编/Others', 2='原创作品/Original', 3='漫画改编/Comic', 4='小说改编/Novel', 5='游戏改编/Game'
	type_source tinyint unsigned not null default 1,
  -- 题材类型, 用type_id保存对应题材, 用'|'作分隔符, 格式示例：'1|3'、'1'、'2|3|1'
  type_genres varchar(50) not null default '',
	-- 用region_id保存对应国家/地区, 用'|'作分隔符, 格式示例：'1|3'、'1'、'2|3|1'
	regions varchar(20) not null default '',
	-- 日期的存储格式, 用'|'作分隔符, 示例：'y-m-d-region|y-m-d-region'
	-- region=''表示无地区
	-- y=9999表示年份未知，一部动画最多只能有一个年份未知
	-- m=99表示月份或季度未知, 1~12表示对应月份, 13=春, 14=夏, 15=秋, 16=冬。选择优先月份, 其次季度, 最后未知
	-- d=99表示日份未知, 1~31表示对应日份
	release_dates varchar(100) not null default '',
	-- 用website_id保存对应视频网站, 用'|'作分隔符, 格式示例：'1|3'、'1'、'2|3|1'
	copyrights varchar(20) not null default '',
  -- 官网链接
  official_url varchar(100) not null default '',
	intro varchar(1000) not null default '',
  -- id可以为空或等于0, 表示没有绑定id
  -- name可以为空
	-- 用'|'作分隔符, 单位格式为position_name:entry_id:person_name, 格式示例：'导演:2:渡边信一郎|旁白:0:渡边信一郎|:212:'
	-- 第一, 在同一部动画中担任同一职位的人员相邻的话要会自动合并职位, 即人物要会共享同一个职位
	-- 第二, 在一部动画中一个人员担任多种职位的情况下, 如果职位没有在前面被合并, 且职位相邻则自动把多种职业合并到同一个人员身上
	staffs varchar(3000) not null default '',
  -- id等于0表示没有绑定id
  -- name可以为空
	-- 用'|'作分隔符,单位格式为character_id:character_name:entry_id:person_name, 格式示例：'1:鲁鲁修:2:福山润|4:XXX:0:|0:旁白:212:'
	-- 单位格式为character_id=0该声优没有角色或暂时不知道
	-- 单位格式为entry_id=0该角色没有声优或暂时不知道
	casts varchar(3000) not null default '',
	submitter_id int unsigned not null,
	submitted_at datetime not null default CURRENT_TIMESTAMP,
  submitter_message varchar(100) not null default '',
	auditor_id int unsigned not null default 0,
	audited_at datetime not null default CURRENT_TIMESTAMP,
  auditor_message varchar(100) not null default '',
  -- 1：草稿状态，用户还未提交或修改完
	-- 2：用户提交或修改后待审核数据、
  -- 3：审核完毕的最新的数据、4：用户提交或修改后审核成功的历史数据、5：用户提交或修改后审核不成功的历史数据(可考虑只保存一段时间, 例如一个月)、
  -- 6：下架状态（只有状态为2的条目才可以下架，下架后将不会在网站公开，除了审核条目之外其他条目的数据会被删除。可以重新上架，数据会重新插入各个表中）
	status tinyint(1) not null default 1,
	created_at datetime not null default CURRENT_TIMESTAMP,
	updated_at datetime not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	primary key (record_id)
);

-- 公开动画条目(动画id, 动画中文名, 动画外文(原)名, 传播类型, 改编类型, 动画简介，最早播放年份，最早播放月份，最早播放日份
--              剧情分，角色分，作画分，演出分，音乐分，平均分，推荐人数，评分总人数)
create table animes (
	-- id不能为0, 0作为未知或没有, id从1开始
	entry_id int unsigned not null auto_increment,
	chinese_name varchar(100) not null default '',
	foreign_name varchar(100) not null default '',
	type_medium tinyint unsigned not null default 1,
	type_source tinyint unsigned not null default 1,
  official_url varchar(100) not null default '',
	intro varchar(1000) not null default '',
  -- 如果年份9999表示未知
  earliest_year smallint unsigned not null default 9999,
  -- 默认99表示月份未知, 1~12表示相应月份, 13~16分别表示春夏秋冬
  earliest_month tinyint unsigned not null default 99,
  -- 默认99表示日份未知, 1~31表示相应日份
  earliest_day tinyint unsigned not null default 99,
  score_story decimal(4,2) unsigned not null default 0,
  score_character decimal(4,2) unsigned not null default 0,
  score_make decimal(4,2) unsigned not null default 0,
  score_show decimal(4,2) unsigned not null default 0,
  score_music decimal(4,2) unsigned not null default 0,
  score_avg decimal(4,2) unsigned not null default 0,
  number_recommends int unsigned NOT NULL default 0,
  number_scores int unsigned NOT NULL default 0,
	primary key (entry_id)
);

-- 动画其他别名(动画id, 动画其他别名)
create table anime_other_names (
  entry_id int unsigned not null,
	other_name varchar(100) not null,
	primary key (entry_id, other_name)
);

-- 动画题材类型(动画id, 题材类型id)
create table anime_type_genres (
  entry_id int unsigned not null,
  type_id smallint unsigned not null,
	primary key (entry_id, type_id)
);

-- 动画制片国家/地区(动画id, 制片国家/地区)
create table anime_regions (
  entry_id int unsigned not null,
  region_id smallint unsigned not null,
	primary key (entry_id, region_id)
);

-- 动画放送/上映日期(动画id, 年, 月, 日, 放送/上映地区)
create table anime_release_dates (
  entry_id int unsigned not null,
  -- 如果年份9999表示未知
  year smallint unsigned not null default 9999,
  -- 默认99表示月份未知, 1~12表示相应月份, 13~16分别表示春夏秋冬
  month tinyint unsigned not null default 99,
  -- 默认99表示日份未知, 1~31表示相应日份
  day tinyint unsigned not null default 99,
  region varchar(20) not null default '',
	primary key (entry_id, year, month, day)
);

-- 动画网络播放版权(动画id, 视频网站缩写)
create table anime_copyrights(
  entry_id int unsigned not null,
	website_id tinyint unsigned not null,
	primary key (entry_id, website_id)
);

-- 动画制作人员表(主键id, 动画id, 担任职位id, 职位名称, 人物id, 人物名字)
create table anime_staffs(
  id int unsigned not null auto_increment,
  entry_id int unsigned not null,
  position_name varchar(100) not null default '',
  -- 先检测id是否为0, 如果为0则说明没绑定id, 以name为准; 如果不为0则说明已经绑定, 可以id对应的信息为准. 下面的person同理
	person_id int unsigned not null default 0,
  person_name varchar(100) not null default '',
	primary key (id)
);

-- 动画声优阵容表(主键id, 动画id, 配音角色id, 角色名字, 声优id, 声优名字)
create table anime_casts(
  id int unsigned not null auto_increment,
  entry_id int unsigned not null,
	character_id int unsigned not null default 0,
	character_name varchar(100) not null default '',
	person_id int unsigned not null default 0,
	person_name varchar(100) not null default '',
	primary key (id)
);
