import type { App } from 'vue';
import { Icon } from './Icon';
import AIcon from '/@/components/jeecg/AIcon.vue';
//Tinymce富文本
import Editor from '/@/components/Tinymce/src/Editor.vue'
import { Button, JUploadButton } from './Button';

const compList = [Icon, AIcon, JUploadButton];

export function registerGlobComp(app: App) {
  compList.forEach((comp) => {
    app.component(comp.name || comp.displayName, comp);
  });
  
  //仪表盘依赖Tinymce，需要提前加载（没办法按需加载了）
  app.component(Editor.name, Editor);
  
  console.log("---初始化---， 全局注册自定义组件--------------")
}
