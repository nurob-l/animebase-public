-- 用户信息(用户id, 昵称, 注册时间, 最近修改时间)
create table user_profiles (
	-- id不能为0, 0作为未知或没有, id从1开始
	user_id int unsigned not null auto_increment,
	username varchar(16) not null unique,
	created_at datetime not null default CURRENT_TIMESTAMP,
	updated_at datetime not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	primary key (user_id)
);

-- 用户本地认证(认证id, 用户id, 邮箱, 密码, 创建时间, 最近修改时间)
create table local_auths (
  -- id不能为0, 0作为未知或没有, id从1开始
  auth_id int unsigned not null auto_increment,
	user_id int unsigned not null,
	email varchar(100) not null unique,
	password char(40) not null,
	created_at datetime not null default CURRENT_TIMESTAMP,
  updated_at datetime not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	primary key (auth_id)
);

-- 角色(角色id，角色名字，角色说明)
create table roles (
  role_id int unsigned not null auto_increment,
  role_name varchar(20) not null,
  description varchar(100) not null default '',
	primary key (role_id)
);

insert into roles (role_id, role_name, description) values (1, '普通用户', '只要是注册了且正常的用户就自动授予该角色');
insert into roles (role_id, role_name, description) values (2, '条目编辑员', '可以添加、修改各类条目，用户注册后自动授予该角色');
insert into roles (role_id, role_name, description) values (3, '条目审核员', '可以审核用户提交的动画、人物等各类审核条目，可以审核通过或不通过');
insert into roles (role_id, role_name, description) values (4, '条目管理员', '可以查看、下架、上架、回退、删除等各类审核条目');

-- 用户扮演的角色(用户id，角色id)
create table user_roles (
	user_id int unsigned not null,
  role_id int unsigned not null,
  primary key (user_id, role_id)
);

-- 权限表(权限id，权限编码，权限说明)
create table permissions (
  permission_id int unsigned not null auto_increment,
  permission_name varchar(100) not null unique,
  description varchar(100) not null default '',
	primary key (permission_id)
);

-- 普通用户权限
insert into permissions (permission_name, description) values ('POST /api/review/animes',         '调用REST API接口：POST /api/review/animes');
insert into permissions (permission_name, description) values ('GET /api/review/animes/:id',      '调用REST API接口：GET /api/review/animes/:id');
insert into permissions (permission_name, description) values ('DELETE /api/review/animes/:id',   '调用REST API接口：DELETE /api/review/animes/:id');
-- 条目编辑员权限
insert into permissions (permission_name, description) values ('GET /api/edit/upload-policy',     '调用REST API接口：GET /api/edit/upload-policy');
insert into permissions (permission_name, description) values ('GET /api/edit/animes/draft',      '调用REST API接口：GET /api/edit/animes/draft');
insert into permissions (permission_name, description) values ('POST /api/edit/animes/save',      '调用REST API接口：POST /api/edit/animes/save');
insert into permissions (permission_name, description) values ('POST /api/edit/animes/submit',    '调用REST API接口：POST /api/edit/animes/submit');
insert into permissions (permission_name, description) values ('DELETE /api/edit/animes/draft',   '调用REST API接口：DELETE /api/edit/animes/draft');
insert into permissions (permission_name, description) values ('GET /api/edit/persons/draft',     '调用REST API接口：GET /api/edit/persons/draft');
insert into permissions (permission_name, description) values ('POST /api/edit/persons/save',     '调用REST API接口：POST /api/edit/persons/save');
insert into permissions (permission_name, description) values ('POST /api/edit/persons/submit',   '调用REST API接口：POST /api/edit/persons/submit');
insert into permissions (permission_name, description) values ('DELETE /api/edit/persons/draft',  '调用REST API接口：DELETE /api/edit/persons/draft');
insert into permissions (permission_name, description) values ('GET /api/edit/animes',            '调用REST API接口：GET /api/edit/animes');
insert into permissions (permission_name, description) values ('GET /api/edit/persons',           '调用REST API接口：GET /api/edit/persons');
insert into permissions (permission_name, description) values ('GET /api/edit/animes/:id',        '调用REST API接口：GET /api/edit/animes/:id');
insert into permissions (permission_name, description) values ('GET /api/edit/persons/:id',       '调用REST API接口：GET /api/edit/persons/:id');
-- 条目审核员权限
insert into permissions (permission_name, description) values ('GET /api/audit/animes',               '调用REST API接口：GET /api/audit/animes');
insert into permissions (permission_name, description) values ('GET /api/audit/persons',              '调用REST API接口：GET /api/audit/persons');
insert into permissions (permission_name, description) values ('GET /api/audit/animes/:id',           '调用REST API接口：GET /api/audit/animes/:id');
insert into permissions (permission_name, description) values ('GET /api/audit/persons/:id',          '调用REST API接口：GET /api/audit/persons/:id');
insert into permissions (permission_name, description) values ('PUT /api/audit/animes/:id/approve',   '调用REST API接口：PUT /api/audit/animes/:id/approve');
insert into permissions (permission_name, description) values ('PUT /api/audit/animes/:id/deny',      '调用REST API接口：PUT /api/audit/animes/:id/deny');
insert into permissions (permission_name, description) values ('PUT /api/audit/persons/:id/approve',  '调用REST API接口：PUT /api/audit/persons/:id/approve');
insert into permissions (permission_name, description) values ('PUT /api/audit/persons/:id/deny',     '调用REST API接口：PUT /api/audit/persons/:id/deny');
-- 管理员权限
insert into permissions (permission_name, description) values ('GET /api/admin/anime-records',                '调用REST API接口：GET /api/admin/anime-records');
insert into permissions (permission_name, description) values ('GET /api/admin/anime-records/:id',            '调用REST API接口：GET /api/admin/anime-records/:id');
insert into permissions (permission_name, description) values ('PUT /api/admin/anime-records/:id/close',      '调用REST API接口：PUT /api/admin/anime-records/:id/close');
insert into permissions (permission_name, description) values ('PUT /api/admin/anime-records/:id/open',       '调用REST API接口：PUT /api/admin/anime-records/:id/open');
insert into permissions (permission_name, description) values ('PUT /api/admin/anime-records/:id/rollback',   '调用REST API接口：PUT /api/admin/anime-records/:id/rollback');
insert into permissions (permission_name, description) values ('PUT /api/admin/anime-records/:id/delete',     '调用REST API接口：PUT /api/admin/anime-records/:id/delete');
insert into permissions (permission_name, description) values ('GET /api/admin/animes',                       '调用REST API接口：GET /api/admin/animes');
insert into permissions (permission_name, description) values ('GET /api/admin/anime-other-names',            '调用REST API接口：GET /api/admin/anime-other-names');
insert into permissions (permission_name, description) values ('GET /api/admin/anime-type-genres',            '调用REST API接口：GET /api/admin/anime-type-genres');
insert into permissions (permission_name, description) values ('GET /api/admin/anime-regions',                '调用REST API接口：GET /api/admin/anime-regions');
insert into permissions (permission_name, description) values ('GET /api/admin/anime-release-dates',          '调用REST API接口：GET /api/admin/anime-release-dates');
insert into permissions (permission_name, description) values ('GET /api/admin/anime-copyrights',             '调用REST API接口：GET /api/admin/anime-copyrights');
insert into permissions (permission_name, description) values ('GET /api/admin/anime-staffs',                 '调用REST API接口：GET /api/admin/anime-staffs');
insert into permissions (permission_name, description) values ('GET /api/admin/anime-casts',                  '调用REST API接口：GET /api/admin/anime-casts');
insert into permissions (permission_name, description) values ('GET /api/admin/person-records',               '调用REST API接口：GET /api/admin/person-records');
insert into permissions (permission_name, description) values ('GET /api/admin/person-records/:id',           '调用REST API接口：GET /api/admin/person-records/:id');
insert into permissions (permission_name, description) values ('PUT /api/admin/person-records/:id/close',     '调用REST API接口：PUT /api/admin/person-records/:id/close');
insert into permissions (permission_name, description) values ('PUT /api/admin/person-records/:id/open',      '调用REST API接口：PUT /api/admin/person-records/:id/open');
insert into permissions (permission_name, description) values ('PUT /api/admin/person-records/:id/rollback',  '调用REST API接口：PUT /api/admin/person-records/:id/rollback');
insert into permissions (permission_name, description) values ('PUT /api/admin/person-records/:id/delete',    '调用REST API接口：PUT /api/admin/person-records/:id/delete');
insert into permissions (permission_name, description) values ('GET /api/admin/dictionary-positions',         '调用REST API接口：GET /api/admin/dictionary-positions');
insert into permissions (permission_name, description) values ('POST /api/admin/dictionary-positions',        '调用REST API接口：POST /api/admin/dictionary-positions');
insert into permissions (permission_name, description) values ('PUT /api/admin/dictionary-positions/:id',     '调用REST API接口：PUT /api/admin/dictionary-positions/:id');
insert into permissions (permission_name, description) values ('DELETE /api/admin/dictionary-positions/:id',  '调用REST API接口：DELETE /api/admin/dictionary-positions/:id');
insert into permissions (permission_name, description) values ('GET /api/admin/dictionary-persons',           '调用REST API接口：GET /api/admin/dictionary-persons');
insert into permissions (permission_name, description) values ('POST /api/admin/dictionary-persons',          '调用REST API接口：POST /api/admin/dictionary-persons');
insert into permissions (permission_name, description) values ('PUT /api/admin/dictionary-persons/:id',       '调用REST API接口：PUT /api/admin/dictionary-persons/:id');
insert into permissions (permission_name, description) values ('DELETE /api/admin/dictionary-persons/:id',    '调用REST API接口：DELETE /api/admin/dictionary-persons/:id');

-- 角色拥有的权限(角色id，权限id)
create table role_permissions (
  role_id int unsigned not null,
	permission_id int unsigned not null,
  primary key (role_id, permission_id)
);

-- 编辑员(用户id，每天提交次数上限，当天已提交次数)
create table role_editors (
	user_id int unsigned not null,
  max_submit int unsigned not null default 30,
  count_submit int unsigned not null default 0,
  primary key (user_id)
);

-- 设置事件，定时清空提交次数
CREATE EVENT `animebase_test`.`reset_count_submit_in_role_editors` 
  ON SCHEDULE EVERY 1 DAY 
  STARTS  '2020-07-16 00:00:00'  ON COMPLETION PRESERVE  
  ENABLE  
  DO begin
    update role_editors set count_submit=0;
  end