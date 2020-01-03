<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div style="margin-bottom: 20px">
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
      <el-collapse-transition>
        <div class="filter-line" v-show="isActive" >
          <el-form :inline="true" :model="listQuery" size="small" label-width="100px">
            <el-form-item  class="top-zero"    label="账户">
              <el-input v-model="listQuery.Account" class="input-width" placeholder="请输入用户账户"></el-input>
            </el-form-item>
            <el-form-item  class="top-zero"   label="姓名：">
              <el-input v-model="listQuery.Name" class="input-width" placeholder="请输入用户姓名"></el-input>
            </el-form-item> 
            <el-form-item class="top-zero" label="状态">
              <el-select v-model="listQuery.StateEnum" placeholder="请选择用户状态" clearable>
                <el-option
                  v-for="item in typeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item> 
          
          </el-form>
        </div>
      </el-collapse-transition>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <div class="btn-heigh">
        <i class="el-icon-tickets"></i>
        <span>数据列表</span>
        <el-button size="mini" type="primary" class="btn-add" @click="handleViewDetail('')">添加用户</el-button> 
        <el-upload
          class="upload-demo btn-add"
          ref="upload"
          action="https://jsonplaceholder.typicode.com/posts/"
          
          :on-change="handleChange"  
          :headers="Tokens"
          :limit="1"
          :file-list="excelFile"
          :before-upload="handleBefore"
          :http-request="uploadDevice"
          accept=".xlsx"
          :auto-upload="false">
          <el-button  size="mini"   slot="trigger"  >选择Excel</el-button>
          <el-button  size="mini"  style="margin-left: 5px;"    @click="submitUpload">上传</el-button> 
        </el-upload>  
      </div> 
    </el-card>
    <div class="page-table" style="margin-top:20px">
      <el-table
        ref="returnApplyTable"
        :data="list"
        style="width: 100%;"
        @selection-change="handleSelectionChange"
        v-loading="listLoading"
        border 
        :max-height="tableHeight || undefined"
         
      >
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="用户账户" width="180" align="center">
          <template slot-scope="scope">{{scope.row.uLoginName}}</template>
        </el-table-column>
        <el-table-column label="用户姓名" align="center">
          <template slot-scope="scope">{{scope.row.uRealName}}</template>
        </el-table-column>
        <el-table-column  label="角色" width="180" align="center">
          <template slot-scope="scope">
              <el-tag style="margin-left:5px" v-for="item in scope.row.RoleNames" :key="item.Id" >
                {{item}}
              </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="姓名"  :show-overflow-tooltip="true" width="160" align="center">
          <template slot-scope="scope">{{scope.row.age === 1 ? "女" : "男"}}</template>
        </el-table-column> 
        <el-table-column label="创建时间" width="180" align="center">
          <template slot-scope="scope">{{scope.row.uCreateTime | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag size="medium" :type="scope.row.deviceState | MapStyle"> 
                {{scope.row.deviceState == 1?"禁用":"正常"}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center">
          <template slot-scope="scope"> 
            <el-button size="mini" @click="handleViewDetail(scope.row)">详情</el-button> 
            <el-button size="mini" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="batch-operate-container">
      <el-select size="small" v-model="operateType" placeholder="批量操作">
        <el-option
          v-for="item in operateOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-button
        style="margin-left: 20px"
        class="search-button"
        @click="handleBatchOperate()"
        type="primary"
        size="small"
      >确定</el-button>
    </div>
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper"
        :current-page.sync="listQuery.PageIndex"
        :page-size="listQuery.PageSize"
        :page-sizes="[5, 10, 20, 50, 100]"
        :total="total"
      ></el-pagination>
    </div> 
    <user-edit ref="dialogUser"  :dialogUser.sync="dialogUser" /> 
  </div>
</template>
<script>
import {
  fetchList,
  userExcelDown,userUpLoad,
  deleteUser
} from "@/api/user";  
import UserEdit from "./component/userEdit.vue"; 
import moment from "moment";  
import collapse from  '@/utils/collapse.js'//条件折叠
const defaultListQuery = {
  PageIndex: 1,
  PageSize: 10,
  Account:null,
  Name: null, 
  StateEnum: -1, 
};

const defaultStatusOptions = [
  {
    value: -1,
    label: "全部"
  },
  {
    value: 0,
    label: "正常"
  },
  {
    value: 1,
    label: "禁用"
  }, 
]; 
export default {
  name: "user",
  components: { collapse },
  data() {
    return { 
      isActive:false,   
      dialogUser: false, 
      listQuery: Object.assign({}, defaultListQuery),
      typeOptions: Object.assign({}, defaultStatusOptions),  
      list: null,
      multipleSelection: [],
      listLoading: false,
      operateType: 1,
      total: null, 
      operateOptions: [
        {
          label: "批量删除",
          value: 1
        }, 
        {
          label:'批量导出',
          value:2
        }
      ],
      Tokens: {
        Authorization: "Bearer " + window.sessionStorage.getItem("Token")
      },
      excelFile:[],
      tableHeight: 0, // 表格最大高度
    };
  }, 
  components: { UserEdit },
  created() {
    this.getList();
  },
  mounted () {
    // 得到表格的高度
    this.tableHeight = this.getTableHeight()
    // 监听页面大小改变
    window.addEventListener('resize', () => {
      // 得到表格的高度
      this.tableHeight = this.getTableHeight()
    })
  },
  filters: { 
    dateFormat(row) {
      var date = row;
      if (date == undefined || date == null || date === "") {
          return "N/A";
      }
      return moment(date).format("YYYY-MM-DD HH:mm:ss "); //HH:mm:ss
    },
    MapStyle: function(value) {
     
      if (!value) return "";
   
      if (value === 0) {
        
        return "success";
      } else if (value === 1) {
        return "danger";
      } else {
        return "info";
      } 
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val; 
    },
    handleResetSearch() {
      this.listQuery = Object.assign({}, defaultListQuery);
    },
    handleSearchList() {
      this.listQuery.PageIndex = 1;
      this.getList();
    },
    handleViewDetail(row) { 
      var self = this;
      self.$refs.dialogUser.showDialog(row);  
      self.dialogUser = true;
      
    }, 
    handleDelete(index, row) {
      let ids = [];
      ids.push(row.uID);
      console.log(ids);
      this.deleteUser(ids);

    },
    handleBatchOperate() {
      if (this.multipleSelection == null || this.multipleSelection.length < 1 ) {
        this.$message({
          message: "请选择要操作的信息",
          type: "warning",
          duration: 1000
        });
        return;
      }
      if (this.operateType === 1) {
        //批量删除
        this.$confirm("是否要进行删除操作?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          //let params = new URLSearchParams();
          let ids = [];
          for (let i = 0, len = this.multipleSelection.length; i < len; i++) {
            ids.push(this.multipleSelection[i].uID);
          }
          console.log(ids);
          let pram = { ids: JSON.stringify(ids) };
          deleteUser(pram).then(response => {
            this.getList();
            this.$message({
              type: "success",
              message: "删除成功!"
            });
          });
        });
      }else{
        this.$confirm("是否要进行批量导出操作？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => { 
          this.downloadDeviceExcel();
        });
      }
    },
    handleSizeChange(val) {
      this.listQuery.PageIndex = 1;
      this.listQuery.PageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.PageIndex = val;
      this.getList();
    },
    deleteUser(ids) {
      let self = this;
      self
        .$confirm("是否要进行该删除操作?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          let pram = { ids: JSON.stringify(ids) };
          console.log(pram);
          deleteUser(pram).then(response => {
            self.$message({
              message: "删除成功！",
              type: "success",
              duration: 1000
            });
            self.getList();
          });
        });
    },
    getList() {
      this.loadListData();
    },
    loadListData(){
      var self = this;
      self.listLoading = true;
      console.log('加载')
      fetchList(self.listQuery).then(response => {  
        self.listLoading = false;
        self.list = response.response.data;
        self.total = response.response.dataCount; 
      }).catch(error => {
        self.listLoading = false;
        console.log(err) 
      });
    },
    downloadDeviceExcel(){
      let self = this;
      var pram ={};
      pram.PageIndex = self.listQuery.PageIndex,
      pram.PageSize = self.listQuery.PageSize; 
      userExcelDown(pram).then(response=>{
        let dateName = new Date().valueOf()
        const blob=new Blob([response],{type:'application/vnd.ms-excel'});
        const a=document.createElement('a');
        document.body.appendChild(a);
        const url=window.URL.createObjectURL(blob);
        a.href=url;
        a.download=dateName+'.xlsx';
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
    },
    submitUpload(fileList) {
      
      console.info(this.excelFile)
      
      this.$refs.upload.submit();
    },
    uploadDevice(params){
      const file = params.file;
      // 根据后台需求数据格式
      const form = new FormData(); 
      // 文件对象
      form.append("files", file);
      userUpLoad(form).then(response=>{
        if(response.success)
        {
          this.$message(msg);
        }else{
           this.$message.error(response.msg);
        }
        console.info(response)
      })
    },
    //把上传的文件追加到列表中
    handleChange(file, fileList) {
      if (fileList.length > 0) {
          this.excelFile = [fileList[fileList.length - 1]]  // 这一步，是 展示最后一次选择的csv文件
      }
    },
    //上传前执行
    handleBefore(fileList){
      console.log(fileList.type)
      this.fileUploadSuffix(fileList,'.xlsx')
    },
    
    //判断后缀是否正确
    fileUploadSuffix(fileList, suffix) {
      let blooean = true 
      let item = fileList // 某一条文件信息
      let fileName = item.name.lastIndexOf('.') // 取到文件名开始到最后一个点的长度
      let fileNameLength = item.name.length // 取到文件名长度
      let hz = item.name.substring(fileName + 1, fileNameLength) // 获取上传文件的后缀名
      // 判断文件名后缀是否合法
      if (suffix.indexOf(hz) === -1) { // 不合法上传文件
        // 删除上传的文件列表中的不合法文件类型
        fileList = null// 删除列表中的数据（删除后文件调整）
        this.excelFile =[];
        // 弹窗显示判断
        blooean = false;
        this.$message({
          message: '只能上传Ecxel文件',
          type: 'warning'
        });
        return blooean
      }else{ 
        return blooean // 返回参数
      }
      
    },
    getTableHeight () {
      // 当表格存在的时候才执行操作
      if (document.getElementsByClassName('el-table').length === 0) {
        return
      }
      const boxH = document.body.clientHeight
      const navH = document.getElementsByClassName('navbar')[0] ? document.getElementsByClassName('navbar')[0].clientHeight : 0
      const tagH = document.getElementsByClassName('tags-view-container')[0] ? document.getElementsByClassName('tags-view-container')[0].clientHeight : 0
      const searchH = document.getElementsByClassName('filter-container')[0] ? document.getElementsByClassName('filter-container')[0].clientHeight : 0
      const operateH = document.getElementsByClassName('operate-container')[0] ? document.getElementsByClassName('operate-container')[0].clientHeight : 0
      const pagerH = document.getElementsByClassName('pagination-container')[0] || { clientHeight: 0 }
      const bottomH = pagerH.clientHeight ? pagerH.clientHeight + 40 : pagerH.clientHeight - 35
      const tab = document.getElementsByClassName('el-table')[0] || { offsetTop: 0 }
      const tabOffT = tab.offsetTop

      // 表格的高度 = 视口高度 - 表格到头部导航的距离 - 头部导航的高度137 - 分页组件的高度100 - 分页组件
      document.getElementsByClassName('el-table')[0].style.height = (boxH - tabOffT - navH - tagH - searchH - bottomH-120) + 'px'
       console.log('表格最大高度为:' + (boxH - navH - tagH - searchH - bottomH))
       console.log('表格的高度:' + (boxH - tabOffT - navH - tagH - searchH - bottomH) )
      return (boxH - navH - tagH - searchH - bottomH-120)
    }
  }
};
</script> 
