<template>
  <div class="dashboard-editor-container">
    <panel-group @handleSetLineChartData="handleSetLineChartData" :statistics-data="panelGroupData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <el-row :gutter="32">
      <!-- <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart />
        </div>
      </el-col> -->
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart :chart-data="pieChartData" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="16">
        <div class="chart-wrapper">
          <bar-chart :chart-data="barChartData" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { statisticsData } from '@/api/user/login-log'
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import RaddarChart from './components/RaddarChart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'

export default {
  name: 'DashboardAdmin',
  components: {
    PanelGroup,
    LineChart,
    RaddarChart,
    PieChart,
    BarChart
  },
  data () {
    return {
      panelGroupData: {},
      lineChartData: {},
      pieChartData: {},
      barChartData: {},
      loginTypeData: {}
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      statisticsData().then(response => {
        if (response.code === 200) {
          const data = response.result
          // panelGroup
          data.loginLogLoginTypeData.map((it, index) => {
            this.$set(this.panelGroupData, it.typeName, it.total)
          })
          // pie
          this.pieChartData = data.provinceStatistics
          // loginType
          data.loginLogLoginTypeData.map((it, index) => {
            this.$set(this.loginTypeData, it.typeName, it)
          })
          // bar
          this.$set(this.barChartData, 'titleData', data.loginLogLoginTitleData)
          data.loginLogLoginTypeData.map((it, index) => {
            this.$set(this.barChartData, it.typeName, it.totalData)
          })
          // 初始line数据
          this.handleSetLineChartData('account')
        }
      })
    },
    handleSetLineChartData (type) {
      this.lineChartData = this.loginTypeData[type]
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
