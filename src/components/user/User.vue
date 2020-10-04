<template>
    <div>
        <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
  <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>用户管理</el-breadcrumb-item>
  <el-breadcrumb-item>用户列表</el-breadcrumb-item>
</el-breadcrumb>

<!-- 卡片视图 -->
<el-card >
    <!-- 搜索与添加区域 -->
    <el-row :gutter="20">
        <el-col :span="8">
    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
    <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
  </el-input>
        </el-col>
    <el-col :span="4">
        <el-button type="primary" @click="adddialogvisble = true">添加用户</el-button>
    </el-col>

  </el-row>
  <!-- 用户列表区 -->
  <el-table :data="userlist" border stripe>
    <el-table-column label="#" type="index"></el-table-column>
      <el-table-column label="姓名" prop="username"></el-table-column>
      <el-table-column label="邮箱" prop="email"></el-table-column>
      <el-table-column label="电话" prop="mobile"></el-table-column>
      <el-table-column label="角色" prop="role_name"></el-table-column>
      <el-table-column label="状态" >
        <template slot-scope="scope">
          <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)" >
        </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180px" >
          <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="showeditfialog(scope.row.id)" icon="el-icon-edit"></el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="reoveuserbyid(scope.row.id)"></el-button>
          <el-tooltip :enterable="false" effect="dark" content="分配角色" placement="top">
            <el-button size="mini" type="warning" icon="el-icon-setting"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
  </el-table>
  <!-- 分页区 -->
   <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
</el-card>
<!-- 添加用户的对话框 -->
<el-dialog
  title="添加用户"
  :visible.sync="adddialogvisble"
  width="50%"
  @close="adddialogclosed">
  <!-- 内容主体区 -->
  <el-form ref="addformref" :rules="addformrules" :model="addfrom" label-width="70px">
  <el-form-item label="用户名" prop="username">
    <el-input v-model="addfrom.username"></el-input>
  </el-form-item>
  <el-form-item label="密码" prop="password">
    <el-input v-model="addfrom.password"></el-input>
  </el-form-item>
  <el-form-item label="邮箱" prop="email">
    <el-input v-model="addfrom.email"></el-input>
  </el-form-item>
  <el-form-item label="手机" prop="mobile">
    <el-input v-model="addfrom.mobile"></el-input>
  </el-form-item>
  </el-form>
  <!-- 底部区 -->
  <span slot="footer" class="dialog-footer">
    <el-button @click="adddialogvisble = false">取 消</el-button>
   <el-button type="primary" @click="adduser">确 定</el-button>
  </span>
</el-dialog>
<!-- 修改用户的对话框 -->
<el-dialog
  title="修改用户"
  :visible.sync="editdialogvisble"
  width="50%"
  @close="editdialogclosed">
  <el-form ref="editfromref" :rules="editfromrules" :model="editfrom" label-width="70px">
  <el-form-item label="用户名">
    <el-input v-model="editfrom.username" disabled></el-input>
  </el-form-item>
  <el-form-item label="邮箱" prop="email">
    <el-input v-model="editfrom.email"></el-input>
  </el-form-item>
  <el-form-item label="手机号" prop="mobile">
    <el-input v-model="editfrom.mobile"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editdialogvisble = false">取 消</el-button>
    <el-button type="primary" @click="edituserinfo">确 定</el-button>
  </span>
</el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    // 验证邮箱规则
    var checkemail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regemail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      // test方法用于效验字符串是否匹配某个模式
      if (regemail.test(value)) {
        // 合法邮箱
        return cb()
      }
      cb(new Error('请输入合法邮箱'))
    }
    // 验证手机号的规则
    var checkmobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regemobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regemobile.test(value)) {
        // 合法手机号
        return cb()
      }
      cb(new Error('请输入合法手机号'))
    }
    return {
    // 获取用户列表参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      userlist: [],
      total: 0,
      // 控制添加用户对话框的显示
      adddialogvisble: false,
      // 添加用户的表单数据
      addfrom: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addformrules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkemail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkmobile, trigger: 'blur' }
        ]
      },
      // 修改用户对话框
      editdialogvisble: false,
      editfrom: {},
      editfromrules: {
        email: [
          +{ required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkemail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkmobile, trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize改变事件
    handleSizeChange (newsize) {
      console.log(newsize)
      this.queryInfo.pagesize = newsize
      this.getUserList()
    },
    // 监听页码值改变事件
    handleCurrentChange (newpage) {
      console.log(newpage)
      this.queryInfo.pagenum = newpage
      this.getUserList()
    },
    async userStateChanged (userinfo) {
      console.log(userinfo)
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 监听添加用户对话框的关闭事件
    adddialogclosed () {
      // $refs是存ref的,resetFields()是清空表单的
      this.$refs.addformref.resetFields()
    },
    // 点击按钮添加新用户 validate表单数据验证 验证成功返回ture失败返回fales
    adduser () {
      this.$refs.addformref.validate(async valid => {
        if (!valid) return
        // 成功发起网络网络请求
        const { data: res } = await this.$http.post('users', this.addfrom)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 隐藏对话框
        this.adddialogvisble = false
        // 刷新列表
        this.getUserList()
      })
    },
    // 展示用户编辑的对话框
    async showeditfialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editfrom = res.data
      this.editdialogvisble = true
    },
    // 监听修改用户的关闭事件
    editdialogclosed () {
      this.$refs.editfromref.resetFields()
    },
    // 修改用户信息并提交
    edituserinfo () {
      this.$refs.editfromref.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editfrom.id, {
          email: this.editfrom.email,
          mobile: this.editfrom.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败')
        }
        // 关闭对话框
        this.editdialogvisble = false
        // 刷新数据列表
        this.getUserList()
        // 显示修改成功
        this.$message.success('更新信息成功')
      })
    },
    async reoveuserbyid (id) {
    // 根据id删除相应用户
      const confirmresult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，则返回字符串confirm
      // 如果用户取消删除则返回cancel
      if (confirmresult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('修改用户成功')
      this.getUserList()
    }
  }
}

</script>

<style lang="less" scoped>

</style>
