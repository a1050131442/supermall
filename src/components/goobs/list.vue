<template>
    <div>
          <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区 -->
  <el-card>
      <el-row :gutter="20">
      <el-col :span="8">
        <el-input placeholder="请输入内容" v-model="queryinfo.query" clearable @clear="getgoodlist">
    <el-button slot="append" icon="el-icon-search" @click="getgoodlist"></el-button>
  </el-input>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="goaddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- table 表格区域 -->
      <el-table :data="goodslist" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="商品名称" prop="goods_name"></el-table-column>
          <el-table-column width="95px" label="商品价格(元)" prop="goods_price"></el-table-column>
          <el-table-column width="70px" label="商品重量" prop="goods_weight"></el-table-column>
          <el-table-column width="140px" label="创建时间" prop="add_time">
              <template slot-scope="scope">
                  {{scope.row.add_time | dateFormat}}
              </template>
          </el-table-column>
          <el-table-column width="130px" label="操作">
              <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="removebyid(scope.row.goods_id)"></el-button>
              </template>
          </el-table-column>
      </el-table>
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page=" queryinfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryinfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      background>
    </el-pagination>
  </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询对象参数
      queryinfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      goodslist: [],
      // 总数据页数
      total: 0
    }
  },
  methods: {
    async getgoodlist () {
      const { data: res } = await this.$http.get('goods', { params: this.queryinfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newsize) {
      this.queryinfo.pagesize = newsize
      this.getgoodlist()
    },
    handleCurrentChange (newpage) {
      this.queryinfo.pagenum = newpage
      this.getgoodlist()
    },
    async removebyid (id) {
      const confirmrsult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmrsult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getgoodlist()
    },
    goaddpage () {
      this.$router.push('/goods/add')
    }
  },
  created () {
    this.getgoodlist()
  }
}
</script>

<style lang="less" scoped>

</style>
