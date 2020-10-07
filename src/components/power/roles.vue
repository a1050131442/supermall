<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片视图 -->
  <el-card>
      <el-row>
          <el-button type="primary" @click="adddialogvisble = true">添加角色</el-button>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="rolelist" border stripe>
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row :class="['bdbottom', i1 ===0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                <!-- 渲染一级权限 -->
                <el-col :span="5">
                  <el-tag closable @close="removeRightbyid(scope.row, item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 渲染二级三级权限 -->
                <el-col :span="19">
                  <el-row :class="[i2 ===0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                    <el-col :span="6">
                     <el-tag type="success" closable @close="removeRightbyid(scope.row, item2.id)">{{item2.authName}}</el-tag>
                     <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag closable type="warning" v-for="(item3) in item2.children" :key="item3.id" @close="removeRightbyid(scope.row, item3.id)">{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <!-- 索引列 -->
           <el-table-column label="#" type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                  <el-table-column label="操作" width="300px">
                      <template slot-scope="scope">
                          <el-button size="mini" type="primary" @click="showeditfialog(scope.row.id)" icon="el-icon-edit">编辑</el-button>
                          <el-button size="mini" type="danger" icon="el-icon-delete" @click="reoveuserbyid(scope.row.id)">删除</el-button>
                          <el-button size="mini" type="warning" icon="el-icon-setting" @click="showsetrighdialog(scope.row)" >分配权限</el-button>
                      </template>
                  </el-table-column>
      </el-table>
  </el-card>
    <!-- 添加用户的对话框 -->
<el-dialog
  title="添加角色"
  :visible.sync="adddialogvisble"
  width="50%"
  @close="adddialogclosed">
  <!-- 内容主体区 -->
  <el-form ref="addformref" :rules="addformrules" :model="addfrom" label-width="80px">
  <el-form-item label="角色名称" prop="roleName">
    <el-input v-model="addfrom.roleName"></el-input>
  </el-form-item>
  <el-form-item label="角色描述" prop="roleDesc">
    <el-input v-model="addfrom.roleDesc"></el-input>
  </el-form-item>
  </el-form>
  <!-- 底部区 -->
  <span slot="footer" class="dialog-footer">
    <el-button @click="adddialogvisble = false">取 消</el-button>
   <el-button type="primary" @click="adduser">确 定</el-button>
  </span>
</el-dialog>
<!-- 修改角色的对话框 -->
<el-dialog
  title="修改角色"
  :visible.sync="editdialogvisble"
  width="50%"
  @close="editdialogclosed">
  <!-- prop对应的不单单是rules规则里面的验证项，同时对应着我们form-item下的v-model的值。prop绑定的类要与el-form-item下的v-model的值相对应 -->
  <el-form ref="editfromref" :rules="editidfromrules" :model="editfrom" label-width="80px">
  <el-form-item label="角色名称" prop="roleName">
    <el-input v-model="editfrom.roleName"></el-input>
  </el-form-item>
  <el-form-item label="角色描述" prop="roleDesc">
    <el-input v-model="editfrom.roleDesc"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editdialogvisble = false">取 消</el-button>
    <el-button type="primary" @click="edituserinfo">确 定</el-button>
  </span>
</el-dialog>
<!-- 分配权限 -->
<el-dialog
  title="分配权限"
  :visible.sync="setrightdialogvisible"
  width="50%"
  @close="setrightdialogclosed">
  <el-tree show-checkbox default-expand-all node-key="id" :data="rightslist" :props="treeProps" :default-checked-keys="defkeys" ref="treeref"></el-tree>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setrightdialogvisible = false">取 消</el-button>
    <el-button type="primary" @click="allotrights">确 定</el-button>
  </span>
</el-dialog>

    </div>
</template>

<script>
export default {
  data () {
    return {
      // 所以角色列表数据
      rolelist: [],
      adddialogvisble: false,
      addfrom: {
        roleName: '',
        roleDesc: ''
      },
      editdialogvisble: false,
      editfrom: {},
      // 修改表单验证规则
      editidfromrules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 添加表单的验证规则对象
      addformrules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 控制分配权限对话框显示与消失
      setrightdialogvisible: false,
      // 所有权限数组
      rightslist: [],
      treeProps: {
        children: 'children',
        label: 'authName'

      },
      defkeys: [],
      roleid: ''
    }
  },
  created () {
    this.getrightslist()
  },
  methods: {
    // 获取所有角色的列表
    async getrightslist () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.rolelist = res.data
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
        const { data: res } = await this.$http.post('roles/', this.addfrom)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        // 隐藏对话框
        this.adddialogvisble = false
        // 刷新列表
        this.getrightslist()
      })
    },
    // 展示用户编辑的对话框
    async showeditfialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
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
        const { data: res } = await this.$http.put('roles/' + this.editfrom.roleId, {
          roleName: this.editfrom.roleName,
          roleDesc: this.editfrom.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败')
        }
        // 关闭对话框
        this.editdialogvisble = false
        // 刷新数据列表
        this.getrightslist()
        // 显示修改成功
        this.$message.success('更新信息成功')
      })
    },
    async reoveuserbyid (id) {
    // 根据id删除相应用户
      const confirmresult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果角色确认删除，则返回字符串confirm
      // 如果角色取消删除则返回cancel
      if (confirmresult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.$message.success('删除角色成功')
      this.getrightslist()
    },
    // 根据id删除对应权限
    async removeRightbyid (row, rightid) {
      // 弹框用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      }
      const { data: res } = await this.$http.delete(`roles/${row.id}/rights/${rightid}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      this.$message.success('删除权限成功')
      // 在标签中函数调用如果有括号则会有ruten返回值
      row.children = res.data
    },
    async showsetrighdialog (role) {
      this.roleid = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightslist = res.data
      this.getleafkeys(role, this.defkeys)
      this.setrightdialogvisible = true
    },
    // 通过递归获取所有三级权限的id
    getleafkeys (node, arr) {
      // 如果当前不包含node属性则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getleafkeys(item, arr))
    },
    setrightdialogclosed () {
      this.defkeys = []
    },
    async allotrights () {
    // ...是将数组拆分成字符串
      const keys = [
        ...this.$refs.treeref.getCheckedKeys(),
        ...this.$refs.treeref.getHalfCheckedKeys()
      ]
      // 添加分隔符‘，’
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleid}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getrightslist()
      this.setrightdialogvisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>
