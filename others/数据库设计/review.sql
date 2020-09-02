-- 动画用户评分(动画条目ID，用户ID，剧情评分，人物评分，作画评分，演出评分，音乐评分，综合总分，是否推荐)
-- 评分是可选的，如果评分存在记录，则短评也一定存在
create table anime_votes (
  entry_id int unsigned not null,
  user_id int unsigned not null,
  score_story tinyint unsigned not null,
  score_character tinyint unsigned not null,
  score_make tinyint unsigned not null,
  score_show tinyint unsigned not null,
  score_music tinyint unsigned not null,
  -- recommend值，1表示是，2表示否
  recommend tinyint unsigned not null,
  created_at datetime not null default CURRENT_TIMESTAMP,
  updated_at datetime not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  primary key (entry_id, user_id)
);

-- 触发器，插入、更新、删除评分时计算总分和人数
DELIMITER $
create trigger count_votes_after_insert after insert on anime_votes for each row
begin
  update animes a, (select  avg(score_story) as avg_story,
                            avg(score_character) as avg_character,
                            avg(score_make) as avg_make,
                            avg(score_show) as avg_show,
                            avg(score_music) as avg_music,
                            ( select count(*)
                              from anime_votes
                              where entry_id = new.entry_id and recommend = 1 ) as number_recommends,
                            count(*) as number_scores
                    from anime_votes where entry_id = new.entry_id) av
  set 
      a.score_story = av.avg_story,
      a.score_character = av.avg_character,
      a.score_make = av.avg_make,
      a.score_show = av.avg_show,
      a.score_music = av.avg_music,
      a.score_avg = av.avg_story * 0.2 + av.avg_character * 0.2 + av.avg_make * 0.2 + av.avg_show * 0.2 + av.avg_music * 0.2,
      a.number_recommends = av.number_recommends,
      a.number_scores = av.number_scores
  where a.entry_id = new.entry_id;
end$
create trigger count_votes_after_update after update on anime_votes for each row
begin
  update animes a, (select  avg(score_story) as avg_story,
                            avg(score_character) as avg_character,
                            avg(score_make) as avg_make,
                            avg(score_show) as avg_show,
                            avg(score_music) as avg_music,
                            ( select count(*)
                              from anime_votes
                              where entry_id = new.entry_id and recommend = 1 ) as number_recommends,
                            count(*) as number_scores
                    from anime_votes where entry_id = new.entry_id) av
  set 
      a.score_story = av.avg_story,
      a.score_character = av.avg_character,
      a.score_make = av.avg_make,
      a.score_show = av.avg_show,
      a.score_music = av.avg_music,
      a.score_avg = av.avg_story * 0.2 + av.avg_character * 0.2 + av.avg_make * 0.2 + av.avg_show * 0.2 + av.avg_music * 0.2,
      a.number_recommends = av.number_recommends,
      a.number_scores = av.number_scores
  where a.entry_id = new.entry_id;
end$
create trigger count_votes_after_delete after delete on anime_votes for each row
begin
  update animes a, (select  ifnull(avg(score_story), 0) as avg_story,
                            ifnull(avg(score_character), 0) as avg_character,
                            ifnull(avg(score_make), 0) as avg_make,
                            ifnull(avg(score_show), 0) as avg_show,
                            ifnull(avg(score_music), 0) as avg_music,
                            ( select count(*)
                              from anime_votes
                              where entry_id = old.entry_id and recommend = 1 ) as number_recommends,
                            count(*) as number_scores
                    from anime_votes where entry_id = old.entry_id) av
  set 
      a.score_story = av.avg_story,
      a.score_character = av.avg_character,
      a.score_make = av.avg_make,
      a.score_show = av.avg_show,
      a.score_music = av.avg_music,
      a.score_avg = av.avg_story * 0.2 + av.avg_character * 0.2 + av.avg_make * 0.2 + av.avg_show * 0.2 + av.avg_music * 0.2,
      a.number_recommends = av.number_recommends,
      a.number_scores = av.number_scores
  where a.entry_id = old.entry_id;
end$
DELIMITER ;

-- 动画用户短评(动画条目ID，用户ID，状态，评论内容)
-- 短评存在记录，不代表评分也一定存在记录
create table anime_reviews (
  entry_id int unsigned not null,
  user_id int unsigned not null,
  -- status值，1表示想看，2表示看过
  status tinyint unsigned not null,
  content varchar(300) not null default '',
  created_at datetime not null default CURRENT_TIMESTAMP,
  updated_at datetime not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  primary key (entry_id, user_id)
);