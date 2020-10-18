<template>
    <div>
         <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
  <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>商品管理</el-breadcrumb-item>
  <el-breadcrumb-item>分类参数</el-breadcrumb-item>
  </el-breadcrumb>
<!-- 卡片区 -->
  <el-card>
      <!-- 警告 -->
   <el-alert
   :closable="false"
    title="注意:只允许为第三级分类设置相关参数"
    type="warning"
    show-icon>
  </el-alert>
  <!-- 选择商品分类区 -->
  <el-row class="cat_opt">
      <span>商品选择分类:</span>
      <!-- 选择商品分类的选择框 -->
      <el-cascader
    v-model="selectedcatekeys"
    :options="catelist"
    :props="cateProps"
    @change="handlechange"></el-cascader>
  </el-row>
   <el-tabs v-model="actuvename" @tab-click="handleClick">
    <el-tab-pane label="动态参数" name="many">
        <el-button :disabled="isBtnDisabled" @click="adddialogvisible = true" type="primary">添加参数</el-button>
    <!-- 动态参数表格 -->
    <el-table :data="manytabledata" border stripe>
       <el-table-column type="expand">
         <template slot-scope="scope">
           <!-- 循环渲染tag标签 -->
           <el-tag @close="handleclose(i,scope.row)" closable v-for="(item, i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
           <el-input
            class="input-new-tag"
            v-if="scope.row.inputVisible"
            v-model="scope.row.inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm(scope.row)"
            @blur="handleInputConfirm(scope.row)">
</el-input>
<el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
         </template>
       </el-table-column>
    <el-table-column label="#" type="index"></el-table-column>
    <el-table-column label="参数名称" prop="attr_name"></el-table-column>
     <el-table-column label="操作">
       <template slot-scope="scope">
         <el-button type="primary" icon="el-icon-edit" size="mini" @click="showeditdialog(scope.row.attr_id)">编辑</el-button>
         <el-button type="danger"  icon="el-icon-delete" size="mini" @click="removeparams(scope.row.attr_id)">删除</el-button>
       </template>
     </el-table-column>
    </el-table>
    </el-tab-pane>
    <el-tab-pane label="静态属性" name="only">
        <el-button :disabled="isBtnDisabled" @click="adddialogvisible = true" type="primary">添加属性</el-button>
          <el-table :data="onlytabledata" border stripe>
        <el-table-column type="expand">
         <template slot-scope="scope">
           <!-- 循环渲染tag标签 -->
           <el-tag @close="handleclose(i,scope.row)" closable v-for="(item, i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
           <el-input
            class="input-new-tag"
            v-if="scope.row.inputVisible"
            v-model="scope.row.inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm(scope.row)"
            @blur="handleInputConfirm(scope.row)">
</el-input>
<el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
         </template>
       </el-table-column>
    <el-table-column label="#" type="index"></el-table-column>
    <el-table-column label="属性名称" prop="attr_name"></el-table-column>
     <el-table-column label="操作">
       <template slot-scope="scope">
         <el-button type="primary" icon="el-icon-edit" size="mini" @click="showeditdialog(scope.row.attr_id)">编辑</el-button>
         <el-button type="danger"  icon="el-icon-delete" size="mini" @click="removeparams(scope.row.attr_id)">删除</el-button>
       </template>
     </el-table-column>
    </el-table>
    </el-tab-pane>
       </el-tabs>
  </el-card>
  <!-- 添加对话框 -->
  <el-dialog
  :title="titleText"
  :visible.sync="adddialogvisible"
  width="50%"
  @close="adddialogclose">
  <!-- 验证规则表单 -->
  <el-form :model="addForm" :rules="addFormrules" ref="addFormref" label-width="100px">
  <el-form-item :label="titleText" prop="attr_name">
    <el-input v-model="addForm.attr_name"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="adddialogvisible = false">取 消</el-button>
    <el-button type="primary" @click="addparams">确 定</el-button>
  </span>
</el-dialog>
<!-- 修改对话框 -->
  <el-dialog
  :title="titleText"
  :visible.sync="editdialogvisible"
  width="50%"
  @close="editdialogclose">
  <!-- 验证规则表单 -->
  <el-form :model="editForm" :rules="editFormrules" ref="editFormref" label-width="100px">
  <el-form-item :label="titleText" prop="attr_name">
    <el-input v-model="editForm.attr_name"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editdialogvisible = false">取 消</el-button>
    <el-button type="primary" @click="editparams">确 定</el-button>
  </span>
</el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      catelist: [],
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedcatekeys: [],
      // 被激活的页签名称
      actuvename: 'many',
      // 动态参数数据
      manytabledata: [],
      // 静态参数数据
      onlytabledata: [],
      // 添加对话框
      adddialogvisible: false,
      // 添加表单验证规则
      addFormrules: {
        attr_name: [
          { required: true, message: '请输参数名称', trigger: 'blur' }
        ]
      },
      // 表单信息
      addForm: {
        attr_name: ''
      },
      // 修改对话框
      editdialogvisible: false,
      // 修改对话框验证规则
      editFormrules: {
        attr_name: [
          { required: true, message: '请输参数名称', trigger: 'blur' }
        ]
      },
      // 修改表单信息
      editForm: {
        attr_name: ''
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取所有的商品分类
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      this.catelist = res.data
    },
    // 选择框发生变化触发事件
    handlechange () {
      this.getparaamsdata()
    },
    // tab 页板点击事件的处理函数
    handleClick () {
      this.getparaamsdata()
    },
    // 获取参数列表
    async getparaamsdata () {
      if (this.selectedcatekeys.length !== 3) {
        this.selectedcatekeys = []
        this.manytabledata = []
        this.onlytabledata = []
        return null
      }
      const { data: res } = await this.$http.get(`categories/${this.cateid}/attributes`, { params: { sel: this.actuvename } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框显示与隐藏
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.actuvename === 'many') {
        this.manytabledata = res.data
      } else {
        this.onlytabledata = res.data
      }
    },
    // 对话框关闭事件
    adddialogclose () {
      this.$refs.addFormref.resetFields()
    },
    // 点击按钮添加参数
    addparams () {
      this.$refs.addFormref.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateid}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.actuvename
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加列表失败')
        }
        this.$message.success('添加列表成功')
        this.adddialogvisible = false
        this.getparaamsdata()
      })
    },
    // 点击按钮修改对话框
    async showeditdialog (id) {
      const { data: res } = await this.$http.get(`categories/${this.cateid}/attributes/${id}`, { params: { attr_sel: this.actuvename } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取列表失败')
      }
      this.editForm = res.data
      this.editdialogvisible = true
    },
    // 修改对话框关闭事件
    editdialogclose () {
      this.$refs.editFormref.resetFields()
    },
    editparams () {
      this.$refs.editFormref.validate(async vaild => {
        if (!vaild) return
        const { data: res } = await this.$http.put(`categories/${this.cateid}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.actuvename
          })
        if (res.meta.status !== 200) {
          return this.$message.error('编辑失败')
        }
        this.$message.success('编辑成功')
        this.getparaamsdata()
        this.editdialogvisible = false
      })
    },
    // 删除参数
    async removeparams (attrid) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 用户取消了删除操作
      console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 删除
      const { data: res } = await this.$http.delete(`categories/${this.cateid}/attributes/${attrid}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getparaamsdata()
    },
    // 文本框失去焦点
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return null
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveattrvals(row)
    },
    // 对于attrvals保存到数据库
    async saveattrvals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateid}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }
      this.$message.success('修改参数成功')
    },
    // 点击文本框按钮
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 标签关闭事件
    handleclose (i, row) {
      // 删除sttr_vals的索引
      row.attr_vals.splice(i, 1)
      // 在数据库中删除
      this.saveattrvals(row)
    }
  },
  // 计算属性
  computed: {
    // 如果按钮被禁用返回ture否则返回false
    isBtnDisabled () {
      if (this.selectedcatekeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 当前选中的id
    cateid () {
      if (this.selectedcatekeys.length === 3) {
        return this.selectedcatekeys[2]
      }
      return null
    },
    // 动态计算标题属性
    titleText () {
      if (this.actuvename === 'many') {
        return '动态属性'
      }
      return '静态参数'
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt{
    margin: 15px 0;
}
.el-tag{
  margin: 10px;
}
.input-new-tag{
  width: 120px;
}
</style>
