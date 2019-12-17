<!-- 个人中心 -->
<template>
   <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button style="float:right" type="primary" @click="handleSearchList()" size="small">查询搜索</el-button>
        <el-button
          style="float:right;margin-right: 15px"
          @click="handleResetSearch()"
          size="small"
        >重置</el-button>
        <el-button
          style="float:right;margin-right: 15px"
          @click="isActive = !isActive"
          size="small"
        >{{isActive?"折叠":"展开"}}<i :class="isActive?'el-icon-caret-bottom':'el-icon-caret-top'"></i></el-button>
        
      </div> 
    </el-card>
</template>

<script>
export default {
  data () {
    return {
    };
  },

  components: {},

  computed: {},

  mounted: {},

  methods: {}
}

</script>
<style lang='scss' scoped>
</style>