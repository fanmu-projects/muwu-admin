<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.chartData = val
        this.setOptions(this.chartData)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      // this.setOptions(this.chartData)
    },
    setOptions(chartData) {
      const titleData = chartData.titleData
      const totalData = chartData.totalData
      const successData = chartData.successData
      const failureData = chartData.failureData
      this.chart.setOption({
        xAxis: {
          data: titleData,
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: false
          }
        },
        legend: {
          data: ['总计', '成功', '失败']
        },
        series: [{
          name: '总计',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#58FAF4',
              lineStyle: {
                color: '#58FAF4',
                width: 2
              }
            }
          },
          data: totalData,
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        },
        {
          name: '成功',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#FF005A',
              lineStyle: {
                color: '#FF005A',
                width: 2
              }
            }
          },
          data: successData,
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        },
        {
          name: '失败',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#3888fa',
              lineStyle: {
                color: '#3888fa',
                width: 2
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: failureData,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        }]
      })
    }
  }
}
</script>
