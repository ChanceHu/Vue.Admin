<template>
  <div class="app-container">
    <!-- 左侧树 -->
    <div class="left">
      <div class="" style="padding-bottom: 10px;" >
        <el-select v-model="menuType" placeholder="请选择菜单类型" style="width: 240px" >
          <el-option
            v-for="(item, index) in listTypeInfo.menuTypeList"
            :key="index"
            :label="item.key"
            :value="item.value"
          />
        </el-select>
      </div>
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
      <el-tabs v-model="tabActive" @tab-click="handleEvent('tabClick')" >
        <el-tab-pane label="菜单详情" name="menu" >
          <!-- 卡片 -->
          <page-card :class="'card'" :title="cardInfo.title" :data.sync="cardInfo.data"  :field-list="cardInfo.fieldList" :list-type-info="listTypeInfo" />
        </el-tab-pane>
        <!-- 点击页面组件时显示 -->
        <el-tab-pane v-if="treeInfo.leftClickData.ComponentType === 1" label="数据权限" name="menuData" >
          <template>
            <div class="">
              <el-button v-if="dataPerms.includes('permission:btnCreate')"   icon="el-icon-plus" 
              type="primary" style="margin-bottom: 10px;" size="small" @click="handleClick('btnCreate')" >  
                添加 
              </el-button>
              <el-button   icon="el-icon-refresh" type="primary" size="small" style="margin-bottom: 10px;" @click="tableInfo.refresh = Math.random()"  >
                刷新
              </el-button>
            </div>
            <!-- 表格 -->
            <page-table
              :class="'table'"
              :refresh="tableInfo.refresh"
              :pager="tableInfo.pager"
              :data.sync="tableInfo.data"
              :api="permsBtnGetAllApi"
              :query="{permsId: treeInfo.leftClickData.Id}"
              :field-list="tableInfo.fieldList"
              :list-type-info="listTypeInfo"
              :handle="tableInfo.handle"
              @handleClick="handleClick"
              @handleEvent="handleEvent"
            />
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 弹窗 -->
    <page-dialog
      :title="dialogInfo.title[dialogInfo.type]"
      :visible.sync="dialogInfo.visible"
      :width="dialogInfo.width"
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
      >
        <!-- 自定义插槽--选择图标 -->
        <template v-slot:form-Icon>
          <el-select v-model="formInfo.data.Icon" placeholder="请选择图标" filterable clearable >
            <template slot="prefix">
              <i v-if="formInfo.data.Icon" :class="'header-icon ' + formInfo.data.Icon" style="vertical-align: middle; font-size: 20px; color: black" />
            </template>
            <el-option v-for="(item, index) in listTypeInfo.iconList" :key="index" :label="item.key" :value="item.value" >
              <slot>
                <i :class="item.value" style="display: inline-block; vertical-align: middle; width: 30px; font-size: 20px" />
                {{ item.class }}
              </slot>
            </el-option>
          </el-select>
        </template>
      </page-form>
      <page-form
        v-if="dialogInfo.type === 'btnCreate' || dialogInfo.type === 'btnUpdate'"
        :ref-obj.sync="dataControlFormInfo.ref"
        :data="dataControlFormInfo.data"
        :field-list="dataControlFormInfo.fieldList"
        :rules="dataControlFormInfo.rules"
        :label-width="dataControlFormInfo.labelWidth"
        :list-type-info="listTypeInfo"
      />
    </page-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { createApi, updateApi, deleteApi, getAllApi, permsBtnCreateApi, permsBtnUpdateApi, permsBtnDeleteApi, permsBtnGetAllApi } from '@/api/system/permission'
import PageTree from '@/components/PageTree'
import PageCard from '@/components/PageCard'
import PageTable from '@/components/PageTable'
import PageDialog from '@/components/PageDialog'
import PageForm from '@/components/PageForm'
import { iconList } from './icon.js'

export default {
  components: {
    PageTree,
    PageCard,
    PageTable,
    PageDialog,
    PageForm
  },
  data () {
    return {
      createApi,
      updateApi,
      deleteApi,
      getAllApi,
      permsBtnCreateApi,
      permsBtnUpdateApi,
      permsBtnDeleteApi,
      permsBtnGetAllApi,
      // 默认的菜单类型
      menuType: 1,
      // 选项卡默认点击
      tabActive: 'menu',
      // 相关列表
      listTypeInfo: {
        iconList: iconList.map(item => {
          item.key = item.class
          item.value = item.class
          return item
        }),
        statusList: [
          { key: '启用', value: true },
          { key: '停用', value: false }
        ],
        menuTypeList: [
          { key: '平台端', value: 1 },
          { key: '论坛端', value: 2 },
          { key: '移动端', value: 3 }
        ],
        componentList: [
          { key: '根目录', value: -1 },
          { key: '页面组件', value: 1 },
          { key: '默认布局组件', value: 2 }
        ],
        componentList1: [
          { key: '页面组件', value: 1 },
          { key: '默认布局组件', value: 2 }
        ],
        dataControlTypeList: [
          { key: '按钮点击', value: 1 },
          { key: '右键菜单', value: 2 },
          { key: '链接访问', value: 3 }
        ],
        reqTypeList: [
          { key: 'GET', value: 1 },
          { key: 'POST', value: 2 },
          { key: 'PUT', value: 3 },
          { key: 'DELETE', value: 4 }
        ],
        treeList: []
      },
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
          key: 'Id', // 节点id
          label: 'Name', // 节点名称字段
          api: getAllApi, // 获取数据的接口
          params: { data: [{ key: 'type', value: 1 }], type: 'query' },
          resFieldList: ['response'] // 数据所在字段
        },
        leftClickData: {},
        rightClickData: {},
        rightMenuList: []
      },
      // 卡片相关
      cardInfo: {
        title: '菜单详情',
        data: {},
        fieldList: [
          { label: '所属菜单', value: 'Pid', list: 'treeList' },
          { label: '菜单类型', value: 'Type', list: 'menuTypeList' },
          { label: '菜单编码', value: 'Code' },
          { label: '菜单名称', value: 'Name' },
          { label: '菜单组件', value: 'ComponentType', list: 'componentList' },
          { label: '菜单图标', value: 'Icon' },
          { label: '重定向路径', value: 'redirect' },
          { label: '排序', value: 'OrderSort' },
          { label: '描述', value: 'Description' },
          { label: '状态', value: 'Enabled', list: 'statusList' },
          { label: '创建人', value: 'CreateBy' },
          { label: '创建时间', value: 'CreateTime' },
          { label: '更新人', value: 'ModifyBy' },
          { label: '更新时间', value: 'ModifyTime' }
        ]
      },
      // 表格相关
      tableInfo: {
        refresh: 1,
        initTable: false,
        initCurpage: 1,
        pager: false,
        data: [],
        fieldList: [
          { label: '所属菜单', value: 'PermsId', list: 'treeList', required: true },
          { label: '功能类型', value: 'Type', list: 'dataControlTypeList', required: true },
          { label: '功能编码', value: 'Code', required: true, minWidth: 160 },
          { label: '功能名称', value: 'Name', required: true },
          { label: '功能api', value: 'Api', required: true },
          { label: '请求方式', value: 'Method', list: 'reqTypeList', required: true }
          // {label: '创建人', value: 'create_user'},
          // {label: '创建时间', value: 'create_time', minWidth: 180},
          // {label: '更新人', value: 'update_user'},
          // {label: '更新时间', value: 'update_time', minWidth: 180}
        ],
        handle: {
          fixed: 'right',
          label: '操作',
          width: '200',
          btList: [
            { label: '编辑', type: '', icon: 'el-icon-edit', event: 'btnUpdate', show: false },
            { label: '删除', type: 'danger', icon: 'el-icon-delete', event: 'btnDelete', show: false }
          ]
        }
      },
      // 表单相关
      formInfo: {
        ref: null,
        data: {
          Id: '', // *唯一ID
          Pid: '', // *父ID
          Type: '', // *菜单类型
          Code: '', // *菜单编码
          Name: '', // *菜单名称
          ComponentType: '', // *菜单组件
          Icon: '', // 菜单图标
          redirect: '', // 重定向路径
          OrderSort: '', // *排序
          Description: '', // 描述
          Enabled: true ,// *状态: 0：停用，1：启用(默认为1)',
          IsHide: false, // 创建人
          // create_time: '', // 创建时间
          // update_user: '', // 修改人
          // update_time: '' // 修改时间
        },
        fieldList: [
          { label: '所属菜单', value: 'Pid', type: 'select', list: 'treeList' },
          { label: '菜单类型', value: 'Type', type: 'tag', list: 'menuTypeList' },
          { label: '菜单编码', value: 'Code', type: 'input' },
          { label: '菜单名称', value: 'Name', type: 'input' },
          { label: '菜单组件', value: 'ComponentType', type: 'select', list: 'componentList1' },
          { label: '菜单图标', value: 'Icon', type: 'slot' },
          { label: '重定向路径', value: 'redirect', type: 'input' },
          { label: '排序', value: 'OrderSort', type: 'input' },
          { label: '描述', value: 'Description', type: 'textarea' },
          { label: '状态', value: 'Enabled', type: 'select', list: 'statusList' },
          { label: '隐藏', value: 'IsHide', type: 'switch' }
        ],
        rules: {},
        labelWidth: '120px'
      },
      dataControlFormInfo: {
        ref: null,
        data: {
          Id: '', // *唯一ID
          PermsId: '', // *菜单ID
          Code: '', // *编码
          Type: '', // *类型
          Name: '', // *名称
          Api: '', // *对应请求API
          Method: '' // *请求方式
          // create_user: '', // 创建人
          // create_time: '', // 创建时间
          // update_user: '', // 修改人
          // update_time: '' // 修改时间
        },
        fieldList: [
          { label: '所属菜单', value: 'PermsId', type: 'tag', list: 'treeList', required: true },
          { label: '功能类型', value: 'Type', type: 'select', list: 'dataControlTypeList', required: true },
          { label: '功能编码', value: 'Code', type: 'input', required: true },
          { label: '功能名称', value: 'Name', type: 'input', required: true },
          { label: '功能api', value: 'Api', type: 'input' },
          { label: '请求方式', value: 'Method', type: 'select', list: 'reqTypeList', required: true }
        ],
        rules: {},
        labelWidth: '120px'
      },
      // 弹窗相关
      dialogInfo: {
        title: {
          create: '添加菜单',
          update: '编辑菜单',
          btnCreate: '添加菜单按钮',
          btnUpdate: '编辑菜单按钮'
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
  computed: {//computed计算属性：只有在它的相关依赖发生改变时才会重新求值，即dataPerms中的数据发生变化时才会重新求值
    ...mapGetters([ 
      'dataPerms'
    ])
  },
  //watch侦听属性：当你有一些数据需要随着其它数据变动而变动时
  //例如当menuType变化时则会执行其方法体中的内容，val则为其变化的值
  watch: {
    menuType: {
      handler (val) {
        this.formInfo.data.Type = val
      },
      immediate: true
    },
    //表单显示关闭时
    'dialogInfo.visible' (val) {
      const formInfo = this.formInfo
      const dataControlFormInfo = this.dataControlFormInfo
      if (!val) {
        // 表单验证初始化
        if (formInfo.ref) {
          formInfo.ref.resetFields()
        }
        if (dataControlFormInfo.ref) {
          dataControlFormInfo.ref.resetFields()
        }
        this.resetForm()
        // 重置弹窗按钮loading
        this.dialogInfo.btLoading = false
      }
    },
    //
    'formInfo.data.Type' (val) {
      const treeInfo = this.treeInfo
      // 初始化卡片显示
      this.cardInfo.data = {}
      // 修改树组件参数
      treeInfo.loadInfo.params.data[0].value = val
      // 设置树重新初始化
      treeInfo.initTree = false
      // 刷新树
      treeInfo.refresh = Math.random()
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
    },
    // 从菜单详情切换到数据权限，获取数据权限列表
    tabActive (val) {
      if (val !== 'menuData') return
      const tableInfo = this.tableInfo
      tableInfo.data = []
      tableInfo.refresh = Math.random()
    }
  },
  mounted () {
    this.getList()
    this.initDataPerms()
    this.initRules()
  },
  methods: {
    // 初始化数据权限
    initDataPerms () {
      const btList = this.tableInfo.handle.btList
      this.$initDataPerms('permission', btList)
    },
    // 初始化验证
    initRules () {
      const formInfo = this.formInfo
      const dataControlFormInfo = this.dataControlFormInfo
      formInfo.rules = this.$initRules(formInfo.fieldList)
      dataControlFormInfo.rules = this.$initRules(dataControlFormInfo.fieldList)
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
    },
    // 获取列表
    getList () {
    },
    // 按钮点击
    handleClick (event, data) {
      const treeInfo = this.treeInfo
      const tableInfo = this.tableInfo
      const dialogInfo = this.dialogInfo
      const formInfo = this.formInfo
      const dataControlFormInfo = this.dataControlFormInfo
      switch (event) {
        case 'btnCreate':
          dialogInfo.type = event
          dialogInfo.visible = true
          // 设置参数
          dataControlFormInfo.data.PermsId = treeInfo.leftClickData.Id
          break
        case 'btnUpdate':
          dialogInfo.type = event
          dialogInfo.visible = true
          // 显示信息
          for (const key in data) {
          // 存在则赋值
            if (key in dataControlFormInfo.data) {
              dataControlFormInfo.data[key] = data[key]
            }
          }
          break
        case 'btnDelete':
          this.$handleAPI('delete', permsBtnDeleteApi, data.Id).then(res => {
            if (res.success) {
              tableInfo.refresh = Math.random()
            }
          })
          break
          // 弹窗点击关闭
        case 'close':
          dialogInfo.visible = false
          break
          // 弹窗点击保存
        case 'save':
          let api; let params; const type = dialogInfo.type; let ref
          if (type === 'create' || type === 'update') {
            params = formInfo.data
            if(type === 'create')
            {
              params.Id = undefined
            } 
            ref = formInfo.ref
          } else if (type === 'btnCreate' || type === 'btnUpdate') {
            params = dataControlFormInfo.data
            if(type === 'btnCreate')
            {
              params.Id = undefined;
            }
            ref = dataControlFormInfo.ref
          } else {
            return
          }
          ref.validate(valid => {
            if (valid) {
              if (type === 'create') {
                api = createApi
              } else if (type === 'update') {
                api = updateApi
              } else if (type === 'btnCreate') {
                api = permsBtnCreateApi
              } else if (type === 'btnUpdate') {
                api = permsBtnUpdateApi
              } else {
                return
              }
              dialogInfo.btLoading = true
              this.$handleAPI(this.getApiType(type), api, params).then(res => {
                if (res.success) {
                  dialogInfo.visible = false
                  // 设置默认项
                  if (type === 'create') {
                    treeInfo.defaultClickedAsyc = params.Pid
                    treeInfo.defaultHighLightAsyc = params.Pid
                    treeInfo.defaultExpandedAsyc = [params.Pid]
                    // 刷新树
                    treeInfo.refresh = Math.random()
                  } else if (type === 'update') {
                    treeInfo.defaultClickedAsyc = params.Id
                    treeInfo.defaultHighLightAsyc = params.Id
                    treeInfo.defaultExpandedAsyc = [params.Pid]
                    // 刷新树
                    treeInfo.refresh = Math.random()
                  } else if (type === 'btnCreate' || type === 'btnUpdate') {
                    tableInfo.refresh = Math.random()
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
    // 返回对应的api类型
    getApiType (type) {
      if (type === 'create' || type === 'update') {
        return type
      } else if (type === 'btnCreate') {
        return 'create'
      } else if (type === 'btnUpdate') {
        return 'update'
      }
    },
    // 触发事件
    handleEvent (event, data) {
      const cardInfo = this.cardInfo
      const treeInfo = this.treeInfo
      const tableInfo = this.tableInfo
      switch (event) {
      // 对表格获取到的数据做处理
        case 'list':
          if (!data) return
          data.forEach(item => {
            item.CreateTime = this.$fn.switchTime(item.CreateTime, 'YYYY-MM-DD hh:mm:ss')
            item.ModifyTime = this.$fn.switchTime(item.ModifyTime, 'YYYY-MM-DD hh:mm:ss')
          })
          
          break
        case 'tabClick':
        // 懒加载，第一次点击，刷新列表
          if (this.tabActive === 'menuData' && !tableInfo.initTable) {
            tableInfo.initTable = true
            tableInfo.refresh = !tableInfo.refresh
          }
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
          obj.CreateTime = this.$fn.switchTime(obj.CreateTime, 'YYYY-MM-DD hh:mm:ss')
          obj.ModifyTime = this.$fn.switchTime(obj.ModifyTime, 'YYYY-MM-DD hh:mm:ss')
          cardInfo.data = obj
          treeInfo.leftClickData = obj
          // tab为数据权限页面，点击刷新表格
          if (this.tabActive === 'menuData') {
            tableInfo.data = []
            tableInfo.refresh = Math.random()
          }
          // 点击不为页面组件，tab显示为菜单详情
          if (obj.ComponentType !== 1) {
            this.tabActive = 'menu'
          }
          break
          // 根据右键点击创建节点对应菜单
        case 'rightClick':
          let arr = []
          // 根节点
          if (data.node.level === 1) {
            arr = [
              { name: '添加下级菜单', type: 'create', data: data.data, node: data.node, vm: data.vm, show: this.dataPerms.includes('permission:create') },
              { name: '刷新', type: 'refreshTree', data: null, node: null, vm: null, show: true }
            ]
          } else {
            arr = [
              { name: '添加下级菜单', type: 'create', data: data.data, node: data.node, vm: data.vm, show: this.dataPerms.includes('permission:create') },
              { name: '编辑', type: 'update', data: data.data, node: data.node, vm: data.vm, show: this.dataPerms.includes('permission:update') },
              { name: '删除', type: 'delete', data: data.data, node: data.node, vm: data.vm, show: this.dataPerms.includes('permission:delete') },
              { name: '刷新', type: 'refreshTree', data: null, node: null, vm: null, show: true }
            ]
          }
          this.treeInfo.rightMenuList = arr
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
          this.$handleAPI(type, deleteApi,nodeData.Id).then(res => {
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
      }
    },
    // 初始化表单
    resetForm () {
      this.formInfo.data = {
        Id: '', // *唯一ID
        Pid: '', // *父ID
        Type: this.menuType, // *菜单类型
        Code: '', // *菜单编码
        Name: '', // *菜单名称
        ComponentType: '', // *菜单组件
        Icon: '', // 菜单图标
        redirect: '', // 重定向路径
        OrderSort: '', // *排序
        Description: '', // 描述
        Enabled: true, // *状态: 0：停用，1：启用(默认为1)',
        IsHide:false
        // create_user: '', // 创建人
        // create_time: '', // 创建时间
        // update_user: '', // 修改人
        // update_time: '' // 修改时间
      }
      this.dataControlFormInfo.data = {
        Id: '', // *唯一ID
        PermsId: '', // *菜单ID
        Code: '', // *编码
        Type: '', // *类型
        Name: '', // *名称
        Api: '', // *对应请求API
        Method: '' // *请求方式
        // create_user: '', // 创建人
        // create_time: '', // 创建时间
        // update_user: '', // 修改人
        // update_time: '' // 修改时间
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .right{
    height: 100%;
    overflow: auto;
  }
</style>
