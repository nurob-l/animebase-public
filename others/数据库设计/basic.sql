-- 创建animebase2.1数据库
-- 创建数据库时, 设置数据库的编码方式 
-- CHARACTER SET:指定数据库采用的字符集, utf8不能写成utf-8
-- COLLATE:指定数据库字符集的排序规则, utf8的默认排序规则为utf8_general_ci(通过show characte
-- create database animebase CHARACTER SET utf8 COLLATE utf8_general_ci;
-- 直接在my.ini文件的[mysqld]字段下配置character-set-server = utf8mb4就不用在创建表时设置默认编码
-- inno_DB要求每个表必须设置主键，否则系统会自动添加主键id
create database animebase;
use animebase;