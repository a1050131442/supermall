<template>
  <el-container class="home-container">
    <!-- 头部区 -->
  <el-header>
    <div>
      <img src="../assets/heima.png" alt="">
      <span>电商后台管理系统</span>
    </div>
  <el-button type='info' @click="logout">退出</el-button>
  </el-header>
  <!-- 页面主体区 -->
  <el-container>
    <!-- 侧边栏 -->
    <el-aside :width=" iscollapse ? '64px' : '200px'">
      <div class="toggle-button" @click="toggleCollapse">|||</div>
      <!-- 侧边栏菜单区 -->
      <el-menu
      background-color="#333744"
      text-color="#fff"
      active-text-color="#409eff"
      unique-opened
      :collapse="iscollapse"
      :collapse-transition="false"
      :router="true"
      :default-active="activepath">
      <!-- 一级菜单 -->
      <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
        <!-- 一级菜单模板区 -->
        <template slot="title">
          <!-- 图标 -->
          <i :class="iconsObj[item.id]"></i>
          <!-- 文本 -->
          <span>{{item.authName}}</span>
        </template>
        <!-- 二级菜单 -->
          <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="savenavstate('/'+subItem.path)">
          <i class="el-icon-menu"></i>
          <!-- 文本 -->
          <span>{{subItem.authName}}</span></el-menu-item>
      </el-submenu>
    </el-menu>
    </el-aside>
    <!-- 右侧内容 -->
    <el-main>
      <router-view></router-view>
      </el-main>
  </el-container>
</el-container>

</template>

<script>
export default {
  data () {
    return {
      menulist: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      iscollapse: false,
      activepath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activepath = window.sessionStorage.getItem('activepath')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(res)
    },
    // 侧边栏展开收起
    toggleCollapse () {
      this.iscollapse = !this.iscollapse
    },
    savenavstate (path) {
      window.sessionStorage.setItem('activepath', path)
      this.activepath = path
    }
  }
}
</script>

<style lang="less" scoped>
.el-header{
  background: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  >div{
    display: flex;
    align-items: center;
  }
}
.el-aside{
background: #333744;
.el-menu{
  border-right:none ;
}
}
.el-main{
  background: #eaedf1;
}
.home-container{
  height: 100%;
}
.iconfont{
  margin-right: 10px;
}
.toggle-button{
  background: #4a5064;
  font-size:10px ;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
