-- 动画传播媒介类型(类型id, 类型名称)
create table type_mediums (
  type_id tinyint unsigned not null auto_increment,
  type_name varchar(20) not null,
	primary key (type_id)
);

-- 主键id不能是0, 否则系统会自动忽略并按自增id填入
insert into type_mediums (type_id, type_name) values (1, '其他');
insert into type_mediums (type_id, type_name) values (2, 'TV');
insert into type_mediums (type_id, type_name) values (3, 'Web');
insert into type_mediums (type_id, type_name) values (4, '电影');
insert into type_mediums (type_id, type_name) values (5, 'OVA');
insert into type_mediums (type_id, type_name) values (6, 'OAD');

-- 动画改编类型(类型id, 类型名称)
create table type_sources (
  type_id tinyint unsigned not null auto_increment,
  type_name varchar(20) not null,
	primary key (type_id)
);

insert into type_sources (type_id, type_name) values (1, '其他');
insert into type_sources (type_id, type_name) values (2, '原创作品');
insert into type_sources (type_id, type_name) values (3, '漫画改编');
insert into type_sources (type_id, type_name) values (4, '小说改编');
insert into type_sources (type_id, type_name) values (5, '游戏改编');

-- 动画题材类型(类型id, 类型名称)
create table type_genres (
  type_id smallint unsigned not null auto_increment,
  type_name varchar(20) not null,
	primary key (type_id)
);

insert into type_genres (type_id, type_name) values (1, '其他/Other');
insert into type_genres (type_id, type_name) values (2, '剧情/Drama');
insert into type_genres (type_id, type_name) values (3, '校园/School');
insert into type_genres (type_id, type_name) values (4, '搞笑/Comedy');
insert into type_genres (type_id, type_name) values (5, '战斗/Action');
insert into type_genres (type_id, type_name) values (6, '日常/Slice of Life');
insert into type_genres (type_id, type_name) values (7, '恋爱/Romance');
insert into type_genres (type_id, type_name) values (8, '科幻/Sci-Fi');
insert into type_genres (type_id, type_name) values (9, '冒险/Adventure');
insert into type_genres (type_id, type_name) values (10, '奇幻/Fantasy');
insert into type_genres (type_id, type_name) values (11, '运动/Sports');
insert into type_genres (type_id, type_name) values (12, '音乐/Music');
insert into type_genres (type_id, type_name) values (13, '机甲/Mecha');
insert into type_genres (type_id, type_name) values (14, '历史/Historical');
insert into type_genres (type_id, type_name) values (15, '战争/Military');
insert into type_genres (type_id, type_name) values (16, '悬疑/Mystery');
insert into type_genres (type_id, type_name) values (17, '惊悚/Thriller');
insert into type_genres (type_id, type_name) values (18, '恐怖/Horror');

-- 制片国家/地区(国家/地区id, 国家/地区中文名, 国家/地区英文名, 国家/地区缩写), 此表主要作用是存储信息, id与国家名字对应关系要硬编码在前端
create table regions (
	-- id不能为0, 0作为未知或没有, id从1开始
	region_id smallint unsigned not null auto_increment,
	region_chinese_name varchar(20) not null,
	region_english_name varchar(20) not null,
  region_abbr char(2) not null,
	primary key (region_id)
);

insert into regions (region_id, region_chinese_name, region_english_name, region_abbr) values (1, '其他', 'Other', 'ot');
insert into regions (region_id, region_chinese_name, region_english_name, region_abbr) values (2, '中国', 'China', 'cn');
-- 设置大陆港澳台主要是考虑到电影可能只在部分地区能上映的情况, 硬编码制片国家/地区时则可略过, 只设置一个中国
-- insert into region (region_chinese_name, region_english_name, region_abbr) values (3, '中国大陆', 'Mainland China', 'cn');
insert into regions (region_id, region_chinese_name, region_english_name, region_abbr) values (4, '中国香港', 'Hong Kong, China', 'hk');
insert into regions (region_id, region_chinese_name, region_english_name, region_abbr) values (5, '中国澳门', 'Macao, China', 'mo');
insert into regions (region_id, region_chinese_name, region_english_name, region_abbr) values (6, '中国台湾', 'Taiwan, China', 'tw');
insert into regions (region_id, region_chinese_name, region_english_name, region_abbr) values (7, '日本', 'Japan', 'jp');
insert into regions (region_id, region_chinese_name, region_english_name, region_abbr) values (8, '美国', 'America', 'us');
-- insert into region (region_id, region_chinese_name, region_english_name, region_abbr) values (9, '韩国', 'South Korea', 'kr');
-- insert into region (region_id, region_chinese_name, region_english_name, region_abbr) values (10, '英国', 'UK', 'uk');
-- insert into region (region_id, region_chinese_name, region_english_name, region_abbr) values (11, '法国', 'France', 'fr');

-- 视频网站(网站id, 网站名字), 此表主要作用是存储信息, id与网站的名字对应关系要硬编码在前端
create table video_websites (
	-- id不能为0, 0作为未知或没有, id从1开始
	website_id tinyint unsigned not null auto_increment,
	website_name varchar(10) not null,
  website_abbr char(2) not null,
	primary key (website_id)
);

insert into video_websites (website_id, website_name, website_abbr) values (1, '其他', 'ot');
insert into video_websites (website_id, website_name, website_abbr) values (2, '哔哩哔哩', 'bi');
insert into video_websites (website_id, website_name, website_abbr) values (3, 'AcFun', 'ac');
insert into video_websites (website_id, website_name, website_abbr) values (4, '爱奇异', 'iq');
insert into video_websites (website_id, website_name, website_abbr) values (5, '优酷', 'yk');
insert into video_websites (website_id, website_name, website_abbr) values (6, '腾讯视频', 'tc');
insert into video_websites (website_id, website_name, website_abbr) values (7, '芒果tv', 'mg');

-- 职位表(职位id, 职位中文名称, 职位英文名称), 此表主要作用是存储信息, id与职位名字对应关系要硬编码在前端
create table positions (
	-- id不能为0, 0作为未知或没有, id从1开始
	position_id smallint unsigned not null auto_increment,
	position  varchar(20) not null,
	english_term_for_position varchar(20) not null default '',
	primary key (position_id)
);

-- insert into positions (position_id, position, english_term_for_position) values (0, '配音演员/声优', 'Voice Actor');
insert into positions (position_id, position, english_term_for_position) values (1, '其他', 'Other');
insert into positions (position_id, position, english_term_for_position) values (2, '原作', 'Original Creator');
insert into positions (position_id, position, english_term_for_position) values (3, '导演/监督', 'Director');
insert into positions (position_id, position, english_term_for_position) values (4, '编剧/脚本', 'Writer');
insert into positions (position_id, position, english_term_for_position) values (5, '系列构成', 'Series Composition');
insert into positions (position_id, position, english_term_for_position) values (6, '角色设计', 'Character Design');
insert into positions (position_id, position, english_term_for_position) values (7, '音乐', 'Music');
insert into positions (position_id, position, english_term_for_position) values (8, '动画制作', 'Animation Production');