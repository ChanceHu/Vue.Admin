<template>
  <div class="app-container">
    <!-- 左侧树 -->
    <div class="left">
      <page-tree
        :expand-all="true"
        :load-type="1"
        :default-clicked="treeInfo.defaultClicked"
        :default-high-light="treeInfo.defaultHighLight"
        :default-expanded="treeInfo.defaultExpanded"
        :tree-data="treeInfo.treeData"
        :base-data.sync="treeInfo.baseData"
        :node-key="treeInfo.nodeKey"
        :load-info.sync="treeInfo.loadInfo"
        :right-menu-list="treeInfo.rightMenuList"
        :tree-refresh="treeInfo.refresh"
        :refresh-level="treeInfo.refreshLevel"
        @handleClick="handleClick"
        @handleEvent="handleEvent"
      />
    </div>
    <div class="right">
      <!-- 卡片 -->
      <page-card
        class="page-card"
        :title="cardInfo.title"
        :data.sync="cardInfo.data"
        :field-list="cardInfo.fieldList"
        :list-type-info="listTypeInfo"
      />
    </div>
    <!-- 弹窗 -->
    <page-dialog
      :title="dialogInfo.title[dialogInfo.type]"
      :visible.sync="dialogInfo.visible"
      :width="dialogInfo.type === 'permissions' ? '80%' : dialogInfo.width"
      :bt-loading="dialogInfo.btLoading"
      :bt-list="dialogInfo.btList"
      @handleClick="handleClick"
      @handleEvent="handleEvent"
    >
      <!-- form -->
      <page-form
        v-if="dialogInfo.type === 'create' || dialogInfo.type === 'update'"
        :ref-obj.sync="formInfo.ref"
        :data="formInfo.data"
        :field-list="formInfo.fieldList"
        :rules="formInfo.rules"
        :label-width="formInfo.labelWidth"
        :list-type-info="listTypeInfo"
      />
      <!-- 权限分配组件 -->
      <permissions
        v-if="dialogInfo.type === 'permissions' && dialogInfo.visible"
        :role-id="treeInfo.rightClickData.Id"
        :role-p-id="treeInfo.rightClickData.Pid"
        :params.sync="roleParams"
      /> 
    </page-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { createApi, updateApi, deleteApi,getListApi, setPermissionsApi, setBindUserApi } from '@/api/system/role'
import PageTree from '@/components/PageTree'
import PageCard from '@/components/PageCard'
import PageDialog from '@/components/PageDialog'
import PageForm from '@/components/PageForm'
import Permissions from './components/permissions' 

export default {
  components: {
    PageTree,
    PageCard,
    PageDialog,
    PageForm,
    Permissions, 
  },
  data () {
    return {
      createApi,
      updateApi,
      deleteApi,
      getListApi,
      // 相关列表
      listTypeInfo: {
        statusList: [
          { key: '启用', value: true },
          { key: '停用', value: false}
        ],
        treeList: []
      },
      // 分配权限相关参数
      roleParams: {},
      
      // 树相关信息
      treeInfo: {
        initTree: false, // 初始化加载
        refresh: 1, // 刷新
        nodeKey: 'key', // 节点绑定字段
        defaultClicked: {}, // 默认点击 (设置为对象，保证数据能被监听到)
        defaultHighLight: '', // 默认高亮
        defaultExpanded: [], // 默认展开
        // 对树删除编辑添加时的临时存储，在树刷新后赋值这些数据的
        defaultClickedAsyc: '', // 默认点击
        defaultHighLightAsyc: '', // 默认高亮
        defaultExpandedAsyc: [], // 默认展开
        treeData: [], // 树渲染数据(非懒加载时由外部渲染)
        baseData: [], // 树的基础数据，从组件中获取到
        // 加载相关数据
        loadInfo: {
          key: 'Id', // 节点id，从api中获取的字段数据
          label: 'Name', // 节点名称字段
          api: getListApi, // 获取数据的接口
          resFieldList: ['response'] // 数据所在字段
        },
        leftClickData: {},
        rightClickData: {},
        rightMenuList: []
      },
      // 卡片相关
      cardInfo: {
        title: '角色详情',
        data: {},
        fieldList: [
          { label: '所属角色', value: 'Pid' ,list: 'treeList'},
          { label: '角色名称', value: 'Name' }, 
          { label: '描述', value: 'Description' },
          { label: '状态', value: 'Enabled', list: 'statusList' },
          { label: '创建人', value: 'CreateBy' },
          { label: '创建时间', value: 'CreateTime' },
          { label: '更新人', value: 'ModifyBy' },
          { label: '更新时间', value: 'ModifyTime' }
        ]
      },
      // 表单相关
      formInfo: {
        data: {
          Id: '', // *唯一ID
          Pid: '', // *父ID
          Name: '', // *角色名称 
          Description: '', // 描述
          Enabled: true // *状态: 0：停用，1：启用(默认为1)'
        },
        fieldList: [
          { label: '所属角色', value: 'Pid', type: 'tag', list: 'treeList', required: true },
          { label: '名称', value: 'Name', type: 'input', required: true },
          // { label: '可创建专栏数', value: 'columns', type: 'inputNumber', min: 1, max: 10, required: true },
          // { label: '可创建用户数', value: 'users', type: 'inputNumber', min: 1, max: 10, required: true },
          { label: '描述', value: 'Description', type: 'textarea', className: 'el-form-block' },
          { label: '状态', value: 'Enabled', type: 'select', list: 'statusList', required: true }
        ],
        rules: {},
        labelWidth: '120px'
      },
      // 弹窗相关
      dialogInfo: {
        title: {
          create: '添加',
          update: '编辑',
          bindUser: '绑定用户',
          permissions: '分配权限'
        },
        visible: false,
        type: '',
        btLoading: false,
        btList: [
          { label: '关闭', type: '', icon: '', event: 'close', show: true },
          { label: '保存', type: 'primary', icon: '', event: 'save', saveLoading: false, show: true }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'dataPerms'
    ])
  },
  watch: {
    'dialogInfo.visible' (val) { 
      if (!val) {
        // 表单验证初始化 
        //this.resetForm()
        // 重置弹窗按钮loading
        this.dialogInfo.btLoading = false
      }
    },
    // 得到树组件数据，处理相关事件
    'treeInfo.baseData' (val) {
      // 得到树状数据
      this.treeInfo.treeData = this.$fn.getTreeArr({
        key: 'Id',
        pKey: 'Pid',
        data: val
      })
      this.initTree(val)
    }
  },
  mounted () {
    this.getList()
    this.initRules()
  },
  methods: {
    // 初始化数据权限
    initDataPerms () {
    },
    // 初始化验证
    initRules () {
      const formInfo = this.formInfo
      formInfo.rules = this.$initRules(formInfo.fieldList)
    },
    initTree (val) {
      const treeInfo = this.treeInfo
      // 操作完后，树刷新，重新设置默认项
      if (treeInfo.initTree) {
        if (treeInfo.defaultClickedAsyc || treeInfo.defaultClickedAsyc === 0) {
          treeInfo.defaultClicked = { id: treeInfo.defaultClickedAsyc }
        }
        if (treeInfo.defaultHighLightAsyc || treeInfo.defaultHighLightAsyc === 0) {
          treeInfo.defaultHighLight = treeInfo.defaultHighLightAsyc
        }
        if (treeInfo.defaultExpandedAsyc.length > 0) {
          treeInfo.defaultExpanded = treeInfo.defaultExpandedAsyc
        }
      }
      // 初始化树
      if (!treeInfo.initTree) {
        treeInfo.initTree = true
        // 容错处理
        if (val[0]) {
          // 设置默认
          treeInfo.defaultClicked = { id: val[0].Id }
          treeInfo.defaultHighLight = val[0].Id
          treeInfo.defaultExpanded = [val[0].Id]
        }
      }
      // 设置列表
      this.listTypeInfo.treeList = val.map(item => {
        item.key = item.Name
        item.value = item.Id
        return item
      })
      this.listTypeInfo.treeList.unshift({ key: 'admin', value: 0 })
    },
    // 获取列表
    getList () {
    },
    // 按钮点击
    handleClick (event, data) {
      const treeInfo = this.treeInfo
      const dialogInfo = this.dialogInfo
      const formInfo = this.formInfo
      switch (event) {
      // 弹窗点击关闭
        case 'close':
          dialogInfo.visible = false
          break
          // 弹窗点击保存
        case 'save':
        // TODO: 暂时这样处理，后面需要将多个个保存区分开来
          if (dialogInfo.type === 'permissions') {
            dialogInfo.btLoading = true
            setPermissionsApi(this.roleParams).then(res => {
              if (res.success) {
                dialogInfo.visible = false
              }
              this.$message({
                showClose: true,
                message: res.msg,
                type: res.success ? 'success' : 'error',
                duration: 3500
              })
              dialogInfo.btLoading = false
            }).catch(() => {
              dialogInfo.btLoading = false
            })
            return
          } 
          formInfo.ref.validate(valid => {
            if (valid) {
              let api; const params = formInfo.data
              const type = dialogInfo.type
              if (type === 'create') {
                api = createApi
                params.Id = undefined;
              } else if (type === 'update') {
                api = updateApi
              } else {
                return
              }
              dialogInfo.btLoading = true
              this.$handleAPI(type, api, params).then(res => {
                if (res.success) {
                  dialogInfo.visible = false
                  // 刷新树
                  treeInfo.refresh = Math.random()
                  // 设置默认项
                  if (type === 'create') {
                    treeInfo.defaultClickedAsyc = params.Pid
                    treeInfo.defaultHighLightAsyc = params.Pid
                    treeInfo.defaultExpandedAsyc = [params.Pid]
                  } else if (type === 'update') {
                    treeInfo.defaultClickedAsyc = params.Id
                    treeInfo.defaultHighLightAsyc = params.Id
                    treeInfo.defaultExpandedAsyc = [params.Pid]
                  }
                }
                dialogInfo.btLoading = false
              }).catch(e => {
                dialogInfo.btLoading = false
              })
            }
          })
          break
      }
    },
    // 触发事件
    handleEvent (event, data) {
      const cardInfo = this.cardInfo
      const treeInfo = this.treeInfo
      // formInfo = this.formInfo
      switch (event) {
      // 对表格获取到的数据做处理
        case 'list':
          break
          // 左键点击的处理
        case 'leftClick':
          const obj = JSON.parse(JSON.stringify(data.data))
          if (obj.columns === -1) {
            obj.columns = '无限'
          }
          if (obj.users === -1) {
            obj.users = '无限'
          }
          obj.create_time = this.$fn.switchTime(obj.create_time, 'YYYY-MM-DD hh:mm:ss')
          obj.update_time = this.$fn.switchTime(obj.update_time, 'YYYY-MM-DD hh:mm:ss')
          cardInfo.data = obj
          break
          // 根据右键点击创建节点对应菜单
        case 'rightClick':
          let arr = []
          // 根节点
          if (data.node.level === 1) {
            arr = [
              { name: '添加下级角色', type: 'create', data: data.data, node: data.node, vm: data.vm, show: this.dataPerms.includes('role:create') },
              { name: '刷新', type: 'refreshTree', data: null, node: null, vm: null, show: true }
            ]
          } else {
            arr = [
              { name: '添加下级角色', type: 'create', data: data.data, node: data.node, vm: data.vm, show: this.dataPerms.includes('role:create') },
              { name: '编辑', type: 'update', data: data.data, node: data.node, vm: data.vm, show: this.dataPerms.includes('role:update') },
              { name: '删除', type: 'delete', data: data.data, node: data.node, vm: data.vm, show: this.dataPerms.includes('role:delete') }, 
              { name: '分配权限', type: 'permissions', data: data.data, node: data.node, vm: data.vm, show: this.dataPerms.includes('role:permission') },
              { name: '刷新', type: 'refreshTree', data: null, node: null, vm: null, show: true }
            ]
          }
          treeInfo.rightMenuList = arr
          treeInfo.rightClickData = JSON.parse(JSON.stringify(data.data))
          break
          // 右键菜单对应的事件处理
        case 'rightEvent':
          this.handleRightEvent(data.type, data)
          break
      }
    },
    // 具体的右键事务处理
    handleRightEvent (type, data) {
      const nodeData = data.data
      const dialogInfo = this.dialogInfo
      const formInfo = this.formInfo
      const treeInfo = this.treeInfo
      switch (type) {
        case 'refreshTree':
        // falls through 告诉ESlint不检查这一行
        case 'refresh':
        // 树刷新
          treeInfo.initTree = false
          treeInfo.refreshLevel = !data.node ? 0 : data.node.level
          treeInfo.refresh = Math.random()
          break
        case 'create':
          dialogInfo.type = type
          dialogInfo.visible = true
          // 设置参数
          formInfo.data.Pid = nodeData.Id
          break
        case 'update':
          dialogInfo.type = type
          dialogInfo.visible = true
          // 显示信息
          for (const key in nodeData) {
          // 存在则赋值
            if (key in formInfo.data) {
              formInfo.data[key] = nodeData[key]
            }
          }
          break
        case 'delete':
          let params = { id:nodeData.Id}
          this.$handleAPI(type, deleteApi, params).then(res => {
            if (res.success) {
            // 删除后，树组件默认指针指向删除元素的父级
              treeInfo.defaultClickedAsyc = nodeData.Pid
              treeInfo.defaultHighLightAsyc = nodeData.Pid
              treeInfo.defaultExpandedAsyc = [nodeData.Pid]
              // 刷新树
              treeInfo.refresh = Math.random()
            }
          })
          break 
        case 'permissions':
          dialogInfo.type = type
          dialogInfo.title[type] = `分配权限(${treeInfo.rightClickData.Name})`
          dialogInfo.visible = true
          break
      }
    },
    // 初始化表单
    resetForm () {
      this.formInfo.data = {
        Id: '', // *唯一ID
        Pid: '', // *父ID
        Name: '', // *角色昵称 
        Description: '', // 描述
        Enabled: true // *状态: 0：停用，1：启用(默认为1)',
        // create_user: '', // 创建人
        // create_time: '', // 创建时间
        // update_user: '', // 修改人
        // update_time: '' // 修改时间
      }
    }
  }
}
</script>

<style scoped>
</style>
