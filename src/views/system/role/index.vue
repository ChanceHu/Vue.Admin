<template>
  <div class="app-container">
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
      <collapse>
        <div  v-show="isActive" style="margin-top: 15px">
          <el-form :inline="true" :model="listQuery" size="small" label-width="100px">
            <el-form-item label="输入名称">
              <el-input v-model="listQuery.Name" class="input-width" placeholder="设备名称"></el-input>
            </el-form-item>
            <el-form-item label="输入编号：">
              <el-input v-model="listQuery.Number" class="input-width" placeholder="设备编号"></el-input>
            </el-form-item>
            <el-form-item label="创建时间">
              <el-date-picker
                class="input-width"
                v-model="listQuery.startTime"
                value-format="yyyy-MM-dd 00:00:00"
                type="date"
                placeholder="请选择时间"
              ></el-date-picker>-
              <el-date-picker
                class="input-width"
                v-model="listQuery.endTime"
                value-format="yyyy-MM-dd 23:59:59"
                type="date"
                placeholder="请选择时间"
              ></el-date-picker>
            </el-form-item> 
            <el-form-item label="状态">
              <el-select v-model="listQuery.StateEnum" placeholder="设备状态" clearable>
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
      </collapse> 
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button size="mini" type="primary" class="btn-add" @click="handleViewDetail('')">录入设备</el-button> 
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
    </el-card>
    <div class="table-container">
      <el-table
        ref="returnApplyTable"
        :data="list"
        style="width: 100%;"
        @selection-change="handleSelectionChange"
        v-loading="listLoading"
        border
      >
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="设备编号" width="180" align="center">
          <template slot-scope="scope">{{scope.row.number}}</template>
        </el-table-column>
        <el-table-column label="设备名称" align="center">
          <template slot-scope="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column  label="归属" width="180" align="center">
          <template  slot-scope="scope">{{scope.row.attribution}}</template>
        </el-table-column>
        <el-table-column label="地址"  :show-overflow-tooltip="true" width="160" align="center">
          <template slot-scope="scope">{{scope.row.address}}</template>
        </el-table-column> 
        <el-table-column label="创建时间" width="180" align="center">
          <template slot-scope="scope">{{scope.row.createdDate | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag size="medium" :type="scope.row.deviceState | MapStyle"> 
                {{scope.row.deviceState == 1?"待整改":"正常"}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center">
          <template slot-scope="scope"> 
            <el-button size="mini" @click="handleViewDetail(scope.row.id)">详情</el-button> 
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
  </div>
</template>
<script>
import {
  fetchList,
  userExcelDown,userUpLoad,
  deleteUser
} from "@/api/user";   
import moment from "moment";  
import collapse from  '@/utils/collapse.js'//条件折叠
const defaultListQuery = {
  PageIndex: 1,
  PageSize: 10,
  Number:null,
  Name: null,
  StartTime: null,
  EndTime: null,
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
  components: { DeviceEdit,collapse },
  data() {
    return { 
      isActive:false,   
      dialogDevice: false, 
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
      excelFile:[]
    };
  }, 
  created() {
    this.getList();
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
    handleViewDetail(id) { 
      var self = this;
      self.$refs.dialogDevice.showDialog(id);  
      self.dialogDevice = true;
      
    }, 
    handleDelete(index, row) {
      let ids = [];
      ids.push(row.id);
      this.deleteDeivecs(ids);
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
            ids.push(this.multipleSelection[i].id);
          }
          console.log(ids);
          let pram = { Ids: JSON.stringify(ids) };
          deleteDevice(pram).then(response => {
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
    deleteDeivecs(ids) {
      let self = this;
      self
        .$confirm("是否要进行该删除操作?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          let pram = { Ids: JSON.stringify(ids) };
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
      var self = this;
      self.listLoading = true;
      console.log('加载')
      fetchList(self.listQuery).then(response => {  
        self.listLoading = false;
        self.list = response.response.data;
        self.total = response.response.totalCount; 
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
      
    }
  }
};
</script> 