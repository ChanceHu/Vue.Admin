<!--  -->
<template>
  <el-dialog
    :title="isEdit?'编辑用户':'添加用户'"
    :close-on-click-modal="false"
    :show-close="true"
    :close-on-press-escape="true"
    :visible.sync="visible"
    :dialog-user="dialogUser"
    @close="handleClose"
  >
    <el-card shadow="never" class="standard-margin">
      <div class="form-container-border">
        <div class="customer-detail">
          <el-form ref="userFrom" :model="userFrom" :rules="ruleValidate" label-width="80px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="账户" prop="uLoginName">
                  <el-input v-model="userFrom.uLoginName" placeholder="请输入用户账户" type="text" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="密码"  >
                  <el-input v-model="userFrom.uLoginPWD" :placeholder="isEdit?'为空则不修改':'默认123456'" type="text" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="昵称" prop="name">
                  <el-input v-model="userFrom.name" placeholder="请输入设备型号" type="text" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别">
                  <el-select v-model="userFrom.sex" placeholder="用户性别">
                    <el-option v-for="(childItem) in sexOptions" :key="childItem.value" :label="childItem.label" :value="childItem.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="真实姓名">
                  <el-input v-model="userFrom.uRealName" placeholder="请输入真实姓名" type="text" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="uEmail">
                  <el-input v-model="userFrom.uEmail" placeholder="请输入邮箱" type="text" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="手机号" prop="uPhone">
                  <el-input v-model="userFrom.uPhone" placeholder="请输入真实姓名" type="text" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="微信">
                  <el-input v-model="userFrom.uWeChat" placeholder="请输入微信" type="text" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="地址">
                  <el-input v-model="userFrom.addr" placeholder="请输入地址" type="text" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="出生日期">
                  <el-date-picker v-model="userFrom.birth" value-format="yyyy-MM-dd" type="date" placeholder="选择日期" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="24">
                <el-form-item label="介绍">
                  <el-input v-model="userFrom.uRemark" type="textarea" placeholder="请输入用户介绍" />
                </el-form-item>
              </el-col>
            </el-row> 
          </el-form>
        </div>
      </div>
    </el-card>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:dialogUser', false)">取 消</el-button>
      <el-button @click="handleSave">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { updateUser, addUser } from '@/api/user' 
const defaultSexOptions = [
  {
    value: 1,
    label: '男'
  },
  {
    value: 0,
    label: '女'
  }
]
export default {
  name: 'User',
  props: {
    dialogUser: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: this.dialogUser,
      userFrom: {}, 
      isEdit: false,
      flowPic: null,
      sexOptions: Object.assign({}, defaultSexOptions),
      ruleValidate: {
        name: [{ required: true, message: '请填写昵称', trigger: 'blur' }],
        uLoginName: [{ required: true, message: '请填写账户登录名', trigger: 'blur' }],
        uEmail: [
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ],
        uPhone: [{ pattern: /^0{0,1}(13[0-9]|15[7-9]|153|156|18[7-9])[0-9]{8}$/, message: '手机号格式不对', trigger: 'blur' }]
      }
    }
  },
  watch: {
    dialogUser() {
      this.visible = this.dialogUser
    }
  },
  created() {

  },
  methods: {
    showDialog(row) {
      var self = this 
      if (row !== undefined && row !== null && row !== '') {
        self.userFrom = row
        self.userFrom.uLoginPWD = ''
        self.isEdit = true
      } else {
        self.isEdit = false
      }
    },
    getDeviceQRCode() {
      var qrPrams = { url: 'https://www.layui.com', pixel: 4, name: this.userFrom.name }
      getDeviceQR(qrPrams).then(response => {
        const blob = new Blob([response])
        const urlCreator = window.URL || window.webkitURL
        const imageUrl = urlCreator.createObjectURL(blob)
        this.flowPic = imageUrl
      })
    },
    handleSave() {
      const self = this
      self.$refs.userFrom.validate(valid => {
        if (valid) {
          const params = Object.assign({}, self.userFrom)
          if (self.isEdit) {
            updateUser(params).then(response => {
              self.$message({
                message: response.msg,
                type: 'success'
              })
              if (response.success) {
                self.handleClose()
                self.$parent.getList()
              }
            })
          } else {
            addUser(params).then(response => {
              self.$message({
                message: response.msg,
                type: 'success'
              })
              if (response.success) {
                self.handleClose()
                self.$parent.getList()
              }
            })
          }
        }
      })
    },
    handleClose() {
      this.$emit('update:dialogUser', false)
      this.userFrom = {}
      window.URL.revokeObjectURL(this.flowPic)
      this.flowPic = null
    }
  }
}

</script>
<style scoped>
.customer-detail {
  height: auto;
  overflow: hidden;
}
.detail-item {
  height: auto;
  overflow: hidden;
  line-height: 25px;
  padding-bottom: 15px;
}
.item-title {
  display: inline-block;
  width: 100px;
  font-size: 14px;
  float: left;
  color: #333;
  text-align: right;
}
.item-content {
  margin-left: 110px;
  color: #999;
}
.input-width {
  width: 213px;
}
.standard-margin {
  margin-top: 15px;
}
</style>
