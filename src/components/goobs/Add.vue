<template>
    <div>
         <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
  <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>商品管理</el-breadcrumb-item>
  <el-breadcrumb-item>添加商品</el-breadcrumb-item>
  </el-breadcrumb>
<!-- 卡片视图 -->
<el-card >
    <!-- 提示信息 -->
     <el-alert
    title="添加商品信息"
    type="info"
    show-icon
    :closable="false">
  </el-alert>
<!-- 步骤条 -->
<el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
  <el-step title="基本信息"></el-step>
  <el-step title="商品信息"></el-step>
  <el-step title="商品属性"></el-step>
  <el-step title="商品图片"></el-step>
  <el-step title="商品内容"></el-step>
  <el-step title="完成"></el-step>
</el-steps>
<!-- tabs栏 -->
<el-form :model="addForm" :rules="addFormrules" ref="ruleForm" label-width="100px" label-position="top">
<el-tabs :before-leave="beforeTableave" v-model="activeIndex" :tab-position="'left'" @tab-click="tabClick">
    <el-tab-pane label="基本信息" name="0">
      <el-form-item label="商品名称" prop="goods_name">
        <el-input v-model="addForm.goods_name"></el-input>
      </el-form-item>
       <el-form-item label="商品价格" prop="goods_price">
        <el-input v-model="addForm.goods_price" type="number"></el-input>
      </el-form-item>
       <el-form-item label="商品重量" prop="goods_weight">
        <el-input v-model="addForm.goods_weight" type="number"></el-input>
      </el-form-item>
       <el-form-item label="商品数量" prop="goods_number">
        <el-input v-model="addForm.goods_number" type="number"></el-input>
      </el-form-item>
       <el-form-item label="商品分类" prop="goods_cat">
      <el-cascader
    v-model="addForm.goods_cat"
    :options="created"
    :props="cateprops"
    @change="handleChange"></el-cascader>
       </el-form-item>
    </el-tab-pane>
    <el-tab-pane label="商品参数" name="1">
      <!-- 渲染表单的item项 -->
      <el-form-item :label="item.attr_name" v-for="item in manytabledata" :key="item.attr_id">
        <el-checkbox-group v-model="item.attr_vals">
    <el-checkbox border :label="cb" v-for="(cb, i) in item.attr_vals" :key="i"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-tab-pane>
    <el-tab-pane label="商品属性" name="2">
       <el-form-item :label="item.attr_name" v-for="item in onlytabledata" :key="item.attr_id">
         <el-input v-model="item.attr_vals"></el-input>
       </el-form-item>
    </el-tab-pane>
    <el-tab-pane label="商品图片" name="3">
      <!-- action图片上传的api地址 -->
      <el-upload
  action="http://81.70.12.207:8888/api/private/v1/upload"
  :on-preview="handlePreview"
  :on-remove="handleRemove"
  list-type="picture"
  :headers="headerobj"
  :on-success="handlesuccess">
  <el-button size="small" type="primary">点击上传</el-button>
</el-upload>
    </el-tab-pane>
    <el-tab-pane label="商品内容" name="4">
      <!-- 富文本编辑器 -->
       <quill-editor
    ref="myQuillEditor"
    v-model="addForm.goods_introduce"/>
    <el-button type="primary" style="margin-top:15px" @click="add">添加商品</el-button>
    </el-tab-pane>
  </el-tabs>
</el-form>
</el-card>
<el-dialog
  title="图片预览"
  :visible.sync="previewvisible"
  width="50%">
  <img :src="previepath" alt="" class="previewimg">
</el-dialog>

    </div>
</template>
<script>
export default {
  data () {
    return {
      // 步骤索引
      activeIndex: '0',
      // 表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 1,
        goods_weight: 1,
        goods_number: 1,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 表单验证规则
      addFormrules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择产品分类', trigger: 'blur' }]
      },
      // 商品分类列表
      created: [],
      cateprops: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      manytabledata: [],
      // 静态属性列表
      onlytabledata: [],
      headerobj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previepath: '',
      previewvisible: false
    }
  },
  created () {
    this.getcatlist()
  },
  methods: {
    async getcatlist () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.created = res.data
    },
    // 级联选择器发生变化
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTableave (activename, oldname) {
      if (oldname === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    async tabClick () {
      // 动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateid}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数失败')
        }
        console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manytabledata = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateid}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败失败')
        }
        this.onlytabledata = res.data
      }
    },
    // 图片预览
    handlePreview (file) {
      console.log(file)
      this.previepath = 'http://81.70.12.207:8888/' + file.response.data.tmp_path
      console.log(this.previepath)
      this.previewvisible = true
    },
    // 处理图片操作
    handleRemove (file) {
      const filepath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x => x.pic === filepath)
      this.addForm.pics.splice(i, 1)
    },
    handlesuccess (response) {
      const picinfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picinfo)
    },
    // 添加商品
    add () {
      this.$refs.ruleForm.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        const addfromcope = this.addForm
        addfromcope.goods_cat = this.addForm.goods_cat.join(',')
        this.manytabledata.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlytabledata.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        addfromcope.attrs = this.addForm.attrs
        const { data: res } = await this.$http.post('goods', addfromcope)
        if (res.meta.status !== 201) {
          console.log(addfromcope)
          return this.$message.error('添加失败')
        }
        console.log(addfromcope)
        this.$message.success('添加成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateid () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox{
  margin: 0 10px 0 0;
}
.previewimg{
  width: 100%;
}
</style>
