import type { ProjectConfig } from '/#/config';
import { MenuTypeEnum, MenuModeEnum, TriggerEnum, MixSidebarTriggerEnum } from '/@/enums/menuEnum';
import { CacheTypeEnum } from '/@/enums/cacheEnum';
import {
  ContentEnum,
  PermissionModeEnum,
  ThemeEnum,
  RouterTransitionEnum,
  SettingButtonPositionEnum,
  SessionTimeoutProcessingEnum,
  TabsThemeEnum,
} from '/@/enums/appEnum';
import { SIDE_BAR_BG_COLOR_LIST, HEADER_PRESET_BG_COLOR_LIST } from './designSetting';
import { primaryColor } from '../../build/config/themeConfig';
import { darkMode } from '/@/settings/designSetting';

// ! 改动后需要清空浏览器缓存
const setting: ProjectConfig = {
  // 是否显示SettingButton
  showSettingButton: true,

  // 是否显示主题切换按钮
  showDarkModeToggle: true,

  // 设置按钮位置 可选项
  // SettingButtonPositionEnum.AUTO: 自动选择
  // SettingButtonPositionEnum.HEADER: 位于头部
  // SettingButtonPositionEnum.FIXED: 固定在右�?
  settingButtonPosition: SettingButtonPositionEnum.AUTO,

  // 权限模式,默认前端角色权限模式
  // ROUTE_MAPPING: 前端模式（菜单由路由生成，默认）
  // ROLE：前端模式（菜单路由分开�?
  // BACK：后台模�?
  permissionMode: PermissionModeEnum.BACK,

  // 权限缓存存放位置。默认存放于localStorage
  permissionCacheType: CacheTypeEnum.LOCAL,

  // 会话超时处理方案
  // SessionTimeoutProcessingEnum.ROUTE_JUMP: 路由跳转到登录页
  // SessionTimeoutProcessingEnum.PAGE_COVERAGE: 生成登录弹窗，覆盖当前页�?
  sessionTimeoutProcessing: SessionTimeoutProcessingEnum.ROUTE_JUMP,

  // 项目主题�?
  themeColor: primaryColor,
  // update-begin--author:liaozhiyang---date:20250414--for：【QQYUN-11956】修复projectSetting中配置主题模式不生效
  // 项目主题模式
  themeMode: darkMode,
  // update-end--author:liaozhiyang---date:20250414--for：【QQYUN-11956】修复projectSetting中配置主题模式不生效

  // 网站灰色模式，用于可能悼念的日期开�?
  grayMode: false,

  // 色弱模式
  colorWeak: false,

  // 是否取消菜单,顶部,多标签页显示, 用于可能内嵌在别的系统内
  fullContent: false,

  // 主题内容宽度
  contentMode: ContentEnum.FULL,

  // 是否显示logo
  showLogo: true,

  // 是否显示底部信息 copyright
  showFooter: false,

  // ai图标显示
  aiIconShow: false,

  // 头部配置
  headerSetting: {
    // 背景�?
    bgColor: HEADER_PRESET_BG_COLOR_LIST[4],
    // 固定头部
    fixed: true,
    // 是否显示顶部
    show: true,
    // 主题
    theme: ThemeEnum.LIGHT,
    // 开启锁屏功�?
    useLockPage: false,
    // 显示全屏按钮
    showFullScreen: false,
    // 显示官网按钮
    showDoc: false,
    // 显示消息中心按钮
    showNotice: false,
    // 显示菜单搜索按钮
    showSearch: false,
  },

  // 菜单配置
  menuSetting: {
    // 背景�?
    bgColor: SIDE_BAR_BG_COLOR_LIST[0],
    // 是否固定住左侧菜�?
    fixed: true,
    // 菜单折叠
    collapsed: false,
    // 折叠菜单时候是否显示菜单名
    collapsedShowTitle: false,
    // 是否可拖�?
    // Only limited to the opening of the left menu, the mouse has a drag bar on the right side of the menu
    canDrag: false,
    // Whether to show no dom
    show: true,
    // Whether to show dom
    hidden: false,
    // 菜单宽度
    menuWidth: 210,
    // 菜单模式
    mode: MenuModeEnum.INLINE,
    // 菜单类型
    type: MenuTypeEnum.SIDEBAR,
    // 菜单主题
    theme: ThemeEnum.DARK,
    // update-begin--author:liaozhiyang---date:20241203---for：【issues/7522】解决menuSetting ts警告
    // 左侧导航栏文字颜色调整区分彩色和暗黑 (不对应配�?
    isThemeBright: false,
    // update-end--author:liaozhiyang---date:20241203---for：【issues/7522】解决menuSetting ts警告
    // 分割菜单
    split: false,
    // 顶部菜单布局
    topMenuAlign: 'center',
    // 折叠触发器的位置
    trigger: TriggerEnum.HEADER,
    // 手风琴模式，只展示一个菜�?
    accordion: true,
    // 在路由切换的时候关闭左侧混合菜单展开菜单
    closeMixSidebarOnChange: false,
    // 左侧混合菜单模块切换触发方式 ‘click�?|'hover'
    mixSideTrigger: MixSidebarTriggerEnum.CLICK,
    // 是否固定左侧混合菜单
    mixSideFixed: false,
  },

  // 多标�?
  multiTabsSetting: {
    // 刷新后是否保留已经打开的标签页
    cache: false,
    // 开�?
    show: true,
    // 是否可以拖拽
    canDrag: true,
    // 开启快速操�?
    showQuick: true,
    // 是否显示刷新按钮
    showRedo: true,
    // 是否显示折叠按钮
    showFold: true,
    // 标签页样�?
    theme: TabsThemeEnum.CARD,
  },

  // 动画配置
  transitionSetting: {
    //  是否开启切换动�?
    // The disabled state will also disable pageLoading
    enable: true,

    // 动画�?Route basic switching animation
    basicTransition: RouterTransitionEnum.FADE_SIDE,

    // 是否打开页面切换loading
    // Only open when enable=true
    openPageLoading: true,

    //是否打开页面切换顶部进度�?
    openNProgress: true,
  },

  // 是否开启KeepAlive缓存  开发时候最好关�?不然每次都需要清除缓�?
  openKeepAlive: true,

  // 自动锁屏时间，为0不锁屏�?单位分钟 默认1个小�?
  lockTime: 0,

  // 显示面包�?
  showBreadCrumb: false,

  // 显示面包屑图�?
  showBreadCrumbIcon: true,

  // 是否使用全局错误捕获
  useErrorHandle: false,

  // 是否开启回到顶�?
  useOpenBackTop: true,

  // 是否可以嵌入iframe页面
  canEmbedIFramePage: true,

  // 切换界面的时候是否删除未关闭的message及notify
  closeMessageOnSwitch: true,

  // 切换界面的时候是否取消已经发送但是未响应的http请求�?
  // 如果开�?想对单独接口覆盖。可以在单独接口设置
  removeAllHttpPending: false,
};

export default setting;
