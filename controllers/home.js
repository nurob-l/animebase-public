const APIError = require('@/rest').APIError
const db = require('@/config/db')
const { Anime } = require('@/model')
const { toCamelForObject } = require('@/libs/transform')

module.exports = {
  // 公共资源
  'GET /api/public/animes/current': async (ctx, next) => {
    const now = new Date()
    // 去除那些多个播放日期且比较相近的动画条目，只保留第一个播放日期
    const statement = `
      SELECT * FROM (
        SELECT * FROM (
          SELECT *, IF(@p1 = entry_id, @r := @r + 1, @r := 1) AS rk, @p1 := entry_id AS grp1
          FROM anime_release_dates JOIN (SELECT @p1 := NULL, @r := 0) r
          WHERE ${getSeasonWhere(now.getFullYear(), now.getMonth() + 1)}
          ORDER BY entry_id, year, month, day
        ) a
        WHERE rk = 1
        ORDER BY year, month, day
      ) d INNER JOIN animes a
      ON d.entry_id = a.entry_id
    `
    
    let result = await db.query(statement)
    ctx.rest(result.map(item => toCamelForObject(item)))
  },
  
  // 公共资源
  'GET /api/public/animes/upcoming': async (ctx, next) => {
    const now = new Date()
    // 去除那些多个播放日期且比较相近的动画条目，只保留第一个播放日期
    const statement = `
      SELECT * FROM (
        SELECT * FROM (
          SELECT *, IF(@p1 = entry_id, @r := @r + 1, @r := 1) AS rk, @p1 := entry_id AS grp1
          FROM anime_release_dates JOIN (SELECT @p1 := NULL, @r := 0) r
          WHERE ${getUpcomingWhere(now.getFullYear(), now.getMonth() + 1)}
          ORDER BY entry_id, year, month, day
        ) a
        WHERE rk = 1
        ORDER BY year, month, day
      ) d INNER JOIN animes a
      ON d.entry_id = a.entry_id
    `
    
    let result = await db.query(statement)
    ctx.rest(result.map(item => toCamelForObject(item)))
  },
  
  // 公共资源
  'GET /api/public/animes/finished': async (ctx, next) => {
    const now = new Date()
    
    const result = await Anime.findAll({
      raw: true,
      attributes: {
        include: [
          [db.col('earliest_year'), 'year'],
          [db.col('earliest_month'), 'month'],
          [db.col('earliest_day'), 'day']
        ]
      },
      where: getFinishedWhere(now.getFullYear(), now.getMonth() + 1)
    })
    ctx.rest(result)
  },
  
  // 公共资源
  'GET /api/public/animes/all': async (ctx, next) => {
    const result = await Anime.findAll({
      raw: true,
      attributes: {
        include: [
          [db.col('earliest_year'), 'year'],
          [db.col('earliest_month'), 'month'],
          [db.col('earliest_day'), 'day']
        ]
      }
    })
    ctx.rest(result)
  }
}

function getSeasonWhere (year, month) {
  switch(month) {
    // 冬季动画(1月新番)
    case 1: case 2: case 3:
      return `(year = ${year - 1} AND month = 16) OR (year = ${year} AND (month BETWEEN 1 AND 3))`
    // 春季动画(4月新番)
    case 4: case 5: case 6:
      return `year = ${year} AND (month BETWEEN 4 AND 7)`
    // 夏季动画(7月新番)
    case 7: case 8: case 9:
      return `year = ${year} AND (month BETWEEN 8 AND 11)`
    // 秋季动画(10月新番)
    case 10: case 11: case 12:
      return `year = ${year} AND (month BETWEEN 12 AND 15)`
  }
}

function getUpcomingWhere (year, month) {
  switch(month) {
    case 1: case 2: case 3:
      return `(year = ${year} AND month >= 4) OR year > ${year}`
    case 4: case 5: case 6:
      return `(year = ${year} AND month >= 8) OR year > ${year}`
    case 7: case 8: case 9:
      return `(year = ${year} AND month >= 12) OR year > ${year}`
    case 10: case 11: case 12:
      return `(year = ${year} AND month >= 16) OR year > ${year}`
  }
}

function getFinishedWhere (year, month) {
  switch (month) {
    case 1: case 2: case 3:
      return {
        [db.Op.or]: [
          { 
            [db.Op.and]: [
              { earliestYear: year - 1 },
              { earliestMonth: { [db.Op.lt]: 16 } }
            ]
          },
          {
            earliestYear: { [db.Op.lt]: year - 1 }
          }
        ]
      }
    case 4: case 5: case 6:
      return {
        [db.Op.or]: [
          {
            [db.Op.and]: [
              { earliestYear: year },
              { earliestMonth: { [db.Op.lt]: 4 } }
            ]
          },
          {
            earliestYear: { [db.Op.lt]: year }
          }
        ]
      }
    case 7: case 8: case 9:
      return {
        [db.Op.or]: [
          {
            [db.Op.and]: [
              { earliestYear: year },
              { earliestMonth: { [db.Op.lt]: 8 } }
            ]
          },
          {
            earliestYear: { [db.Op.lt]: year }
          }
        ]
      }
    case 10: case 11: case 12:
      return {
        [db.Op.or]: [
          {
            [db.Op.and]: [
              { earliestYear: year },
              { earliestMonth: { [db.Op.lt]: 12 } }
            ]
          },
          {
            earliestYear: { [db.Op.lt]: year }
          }
        ]
      }
  }
}