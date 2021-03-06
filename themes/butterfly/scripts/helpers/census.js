const cheerio = require('cheerio')
const moment = require('moment')
const fetch = require('node-fetch')

// hexo.extend.filter.register('after_render:html', async function (locals) {
//   const $ = cheerio.load(locals)
//   const map = $('#map-chart')
//   const trend = $('#trends-chart')
//   const source = $('#sources-chart')
//   let htmlEncode = false

//   if (map.length > 0 || trend.length > 0 || source.length > 0) {
//     if (map.length > 0 && $('#mapChart').length === 0) {
//       map.after(await mapChart())
//     }
//     if (trend.length > 0 && $('#trendsChart').length === 0) {
//       trend.after(await trendsChart())
//     }
//     if (source.length > 0 && $('#sourcesChart').length === 0) {
//       source.after(await sourcesChart())
//     }

//     if (htmlEncode) {
//       return $.root().html().replace(/&amp;#/g, '&#')
//     } else {
//       return $.root().html()
//     }
//   } else {
//     return locals
//   }
// }, 15)

// const CLIENT_ID = 'oTe3eg0Ggy1AKYBTmNIrO0Cm'
// const REDIRECT_URI = 'oob'
// const CLIENT_SECRET = 'Ygpg5sERFfOuV6LTUorWYy8kpXbMhseH'
// http://openapi.baidu.com/oauth/2.0/authorize?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope=basic&display=popup
// http://openapi.baidu.com/oauth/2.0/token?grant_type=authorization_code&code={CODE}&client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}&redirect_uri={REDIRECT_URI}

// http://openapi.baidu.com/oauth/2.0/authorize?response_type=code&client_id=oTe3eg0Ggy1AKYBTmNIrO0Cm&redirect_uri=oob&scope=basic&display=popup
// http://openapi.baidu.com/oauth/2.0/token?grant_type=authorization_code&code=990224ad31df5ac67009344449e03f5d&client_id=oTe3eg0Ggy1AKYBTmNIrO0Cm&client_secret=Ygpg5sERFfOuV6LTUorWYy8kpXbMhseH&redirect_uri=oob

const startDate = '20210101' // 开始日期
const endDate = moment().format('YYYYMMDD') // 结束日期
const accessToken = '121.e7c3c9456cd0876a0d585869bfdfb174.YgQZrhZlqxDAW06VGQqduYS7ylGnNubAf2MYfM-.Pvyrig' // accessToken
const siteId = '16265874' // 网址id
const dataUrl = 'https://openapi.baidu.com/rest/2.0/tongji/report/getData?access_token=' + accessToken + '&site_id=' + siteId
const metrics = 'pv_count' // 统计访问次数 PV 填写 'pv_count'，统计访客数 UV 填写 'visitor_count'，二选一
const metricsName = (metrics === 'pv_count' ? '访问次数' : (metrics === 'visitor_count' ? '访客数' : ''))

// 访问地图
function mapChart () {
  return new Promise(resolve => {
    // const paramUrl = '&start_date=' + startDate + '&end_date=' + endDate + '&metrics=' + metrics + '&method=visit/district/a'; // 更换请求地址
    const paramUrl = '&start_date=' + startDate + '&end_date=' + endDate + '&metrics=' + metrics + '&method=overview/getDistrictRpt';
    fetch(dataUrl + paramUrl).then(data => data.json()).then(data => {
      monthArr = [];
      const mapName = data.result.items[0]
      const mapValue = data.result.items[1]
      const mapArr = []
      const max = mapValue[0][0]
      for (let i = 0; i < mapName.length; i++) {
        // mapArr.push({ name: mapName[i][0].name, value: mapValue[i][0] })
        mapArr.push({ name: mapName[i][0], value: mapValue[i][0] })
      }
      const mapArrJson = JSON.stringify(mapArr)
      resolve(`
        <script id="mapChart">
          var color = document.documentElement.getAttribute('data-theme') === 'light' ? '#4c4948' : 'rgba(255,255,255,0.7)'
          var mapChart = echarts.init(document.getElementById('map-chart'), 'light');
          var mapOption = {
            title: {
              text: '博客访问来源地图',
              x: 'center',
              textStyle: {
                color: color
              }
            },
            tooltip: {
              trigger: 'item'
            },
            visualMap: {
              min: 0,
              max: ${max},
              left: 'left',
              top: 'bottom',
              text: ['高','低'],
              color: ['#49b1f5', '#92d0f9'],
              textStyle: {
                color: color
              },
              calculable: true
            },
            series: [{
              name: '${metricsName}',
              type: 'map',
              mapType: 'china',
              showLegendSymbol: false,
              label: {
                emphasis: {
                  show: false
                }
              },
              label: {
                normal: {
                  show: false
                },
                emphasis: {
                  show: true,
                  color: '#617282'
                }
              },
              itemStyle: {
                normal: {
                  areaColor: 'rgb(230, 232, 234)',
                  borderColor: 'rgb(255, 255, 255)',
                  borderWidth: 1
                },
                emphasis: {
                  areaColor: 'gold'
                }
              },
              data: ${mapArrJson}
            }]
          };
          mapChart.setOption(mapOption);
          window.addEventListener("resize", () => { 
            mapChart.resize();
          });
        </script>`);
    }).catch(function (error) {
      console.log(error);
    });
  })
}

// 访问趋势
function trendsChart () {
  return new Promise(resolve => {
    const paramUrl = '&start_date=' + startDate + '&end_date=' + endDate + '&metrics=' + metrics + '&method=trend/time/a&gran=month'
    fetch(dataUrl + paramUrl).then(data => data.json()).then(data => {
      const monthArr = []
      const monthValueArr = []
      const monthName = data.result.items[0]
      const monthValue = data.result.items[1]
      for (let i = monthName.length - 1; i >= 0; i--) {
        monthArr.push(monthName[i][0].substring(0, 7).replace('/', '-'))
        monthValueArr.push(monthValue[i][0] !== '--' ? monthValue[i][0] : 0)
      }
      const monthArrJson = JSON.stringify(monthArr)
      const monthValueArrJson = JSON.stringify(monthValueArr)
      resolve(`
        <script id="trendsChart">
          var color = document.documentElement.getAttribute('data-theme') === 'light' ? '#4c4948' : 'rgba(255,255,255,0.7)'
          var trendsChart = echarts.init(document.getElementById('trends-chart'), 'light');
          var trendsOption = {
            title: {
              text: '博客访问统计图',
              x: 'center',
              textStyle: {
                color: color
              }
            },
            tooltip: {
              trigger: 'axis'
            },
            xAxis: {
              name: '日期',
              type: 'category',
              boundaryGap: false,
              nameTextStyle: {
                color: color
              },
              axisTick: {
                show: false
              },
              axisLabel: {
                show: true,
                color: color
              },
              axisLine: {
                show: true,
                lineStyle: {
                  color: color
                }
              },
              data: ${monthArrJson}
            },
            yAxis: {
              name: '${metricsName}',
              type: 'value',
              nameTextStyle: {
                color: color
              },
              splitLine: {
                show: false
              },
              axisTick: {
                show: false
              },
              axisLabel: {
                show: true,
                color: color
              },
              axisLine: {
                show: true,
                lineStyle: {
                  color: color
                }
              }
            },
            series: [{
              name: '${metricsName}',
              type: 'line',
              smooth: true,
              lineStyle: {
                  width: 0
              },
              showSymbol: false,
              itemStyle: {
                opacity: 1,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: 'rgba(128, 255, 165)'
                },
                {
                  offset: 1,
                  color: 'rgba(1, 191, 236)'
                }])
              },
              areaStyle: {
                opacity: 1,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: 'rgba(128, 255, 165)'
                }, {
                  offset: 1,
                  color: 'rgba(1, 191, 236)'
                }])
              },
              data: ${monthValueArrJson},
              markLine: {
                data: [{
                  name: '平均值',
                  type: 'average',
                  label: {
                    color: color
                  }
                }]
              }
            }]
          };
          trendsChart.setOption(trendsOption);
          window.addEventListener("resize", () => { 
            trendsChart.resize();
          });
        </script>`)
    }).catch(function (error) {
      console.log(error);
    });
  })
}

// 访问来源
function sourcesChart () {
  return new Promise(resolve => {
    const paramUrl = '&start_date=' + startDate + '&end_date=' + endDate + '&metrics=' + metrics + '&method=source/all/a';
    fetch(dataUrl + paramUrl).then(data => data.json()).then(data => {
      const sourcesName = data.result.items[0]
      const sourcesValue = data.result.items[1]
      const sourcesArr = []
      for (let i = 0; i < sourcesName.length; i++) {
        sourcesArr.push({ name: sourcesName[i][0].name, value: sourcesValue[i][0] })
      }
      const sourcesArrJson = JSON.stringify(sourcesArr)
      resolve(`
        <script id="sourcesChart">
          var color = document.documentElement.getAttribute('data-theme') === 'light' ? '#4c4948' : 'rgba(255,255,255,0.7)'
          var sourcesChart = echarts.init(document.getElementById('sources-chart'), 'light');
          var sourcesOption = {
            title: {
              text: '博客访问来源统计图',
              x: 'center',
              textStyle: {
                color: color
              }
            },
            legend: {
              top: 'bottom',
              textStyle: {
                color: color
              }
            },
            tooltip: {
              trigger: 'item'
            },
            series: [{
              name: '${metricsName}',
              type: 'pie',
              radius: [30, 80],
              center: ['50%', '50%'],
              roseType: 'area',
              label: {
                color: color,
                formatter: "{b} : {c} ({d}%)"
              },
              data: ${sourcesArrJson},
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(255, 255, 255, 0.5)'
                }
              }
            }]
          };
          sourcesChart.setOption(sourcesOption);
          window.addEventListener("resize", () => { 
            sourcesChart.resize();
          });
        </script>`);
    }).catch(function (error) {
      console.log(error);
    });
  })
}