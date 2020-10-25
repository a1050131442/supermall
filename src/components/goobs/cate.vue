<template>
    <div>
         <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
  <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>商品管理</el-breadcrumb-item>
  <el-breadcrumb-item>商品分类</el-breadcrumb-item>
  </el-breadcrumb>
<!-- 卡片视图 -->
<el-card >
    <el-row>
     <el-button type="primary" @click="showaddcatedialog">添加分类</el-button>
    </el-row>
    <!-- 表格 -->
    <!-- 是否有效 -->
    <tree-table class="treetable" :border="true" :data="catelist" :columns="columns" :selection-type = "false" :expand-type = "false" :show-index = "true" index-text="#">
      <template slot="isok" slot-scope="scope">
        <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
        <i class="el-icon-error" v-else style="color: red"></i>
      </template>
      <!-- 排序 -->
      <template slot="order" slot-scope="scope">
        <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
        <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
        <el-tag type="warning" size="mini" v-else>三级</el-tag>
      </template>
      <!-- 操作 -->
      <template slot="opt" >
        <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
        <el-button  type="danger" icon="el-icon-delete" size="mini">删除</el-button>
      </template>
    </tree-table>
    <!-- 分页区 -->
     <el-pagination
      @size-change="handlesizeChange"
      @current-change="handleCurrentChange"
      :current-page="querinfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="querinfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

</el-card>
<!-- 添加分类对话框 -->
<el-dialog
  title="添加分类"
  :visible.sync="addcatedialogvisible"
  width="50%"
  @close="addCatedialogclised">
  <el-form ref="addcateformref" :model="addcatefrom" label-width="100px" :rules="addcatfromrules">
  <el-form-item label="分类名称" prop="cat_name">
    <el-input v-model="addcatefrom.cat_name"></el-input>
  </el-form-item>
    <el-form-item label="父级分类">
      <el-cascader
    v-model="selectedkeys"
    :options="parentcatelist"
    :props="cascaderprops"
    @change="parentcatechanged"
    clearable
    change-on-select></el-cascader>

  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addcatedialogvisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
</el-dialog>

    </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类的数据列表
      catelist: [],
      // 查询条件
      querinfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类页码
      total: 0,
      // 为table制定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'opt'
        }
      ],
      // 显示添加对话框
      addcatedialogvisible: false,
      // 添加表单
      addcatefrom: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类验证表单规则对象
      addcatfromrules: {
        cat_name: [
          { required: true, message: '请输入分类名', trigger: 'blur' }
        ]
      },
      // 父类列表
      parentcatelist: [],
      // 指定筛选器配置的对象
      cascaderprops: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类id数组
      selectedkeys: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.querinfo })
      if (res.meta.status !== 200) {
        return this.$message.console.error('获取山坡分类失败')
      }
      this.catelist = res.data.result
      // 总数据条数赋值
      this.total = res.data.total
    },
    // 监听pagesize改变
    handlesizeChange (newsize) {
      this.querinfo.pagesize = newsize
      this.getCateList()
    },
    // pagenum改变
    handleCurrentChange (newnum) {
      this.querinfo.pagenum = newnum
      this.getCateList()
    },
    // 显示添加分类对话框
    showaddcatedialog () {
      this.getparentcatelist()
      this.addcatedialogvisible = true
    },
    // 获取父级分类列表
    async getparentcatelist () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      console.log(this.parentcatelist)
      this.parentcatelist = res.data
    },
    // 选择项发生变化触发这个方法
    parentcatechanged () {
      console.log(this.selectedkeys)
      // 如果selectedkeys的个数大于零证明选中了分类如果没有则没有选中
      if (this.selectedkeys.length > 0) {
        // 父级分类的id
        this.addcatefrom.cat_pid = this.selectedkeys[this.selectedkeys.length - 1]
        this.addcatefrom.cat_level = this.selectedkeys.length
      } else {
        if (this.selectedkeys.length > 0) {
        // 父级分类的id
          this.addcatefrom.cat_pid = 0
          this.addcatefrom.cat_level = 0
        }
      }
    },
    addCate () {
      this.$refs.addcateformref.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addcatefrom)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addcatedialogvisible = false
      }

      )
    },
    // 对话框关闭事件
    addCatedialogclised () {
      this.$refs.addcateformref.resetFields()
      this.selectedkeys = []
      this.addcatefrom.cat_level = 0
      this.addcatefrom.cat_pid = 0
    }
  }
}
</script>

<style lang="less" scoped>
.treetable{
  margin-top:15px ;
}
.el-cascader{
  width: 100%;
}
</style>
