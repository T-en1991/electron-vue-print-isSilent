<template>
  <div>
    <div style="margin: 10px">
      <el-button type="primary" @click="getP">测试，获取打印机列表</el-button>
    </div>
    <div style="margin: 10px">
      <el-button type="primary" @click="dialogVisible = true">设置，我要选择打印机</el-button>
    </div>

    <div style="margin: 10px">
      <el-button type="primary" @click="print">打印,我要开始打印了</el-button>
    </div>

    <div v-if="dialogVisible">
      <el-dialog
        title="设置"
        :visible="true"
        width="50%"
        :before-close="handleClose">
        <p>是否静默</p>
        <el-switch
          v-model="isSilent"
          active-text="静默"
          inactive-text="非静默">
        </el-switch>
        <p>单选，请选择一款打印机</p>
        <el-radio v-model="printName" :label="item.name" v-for="(item,idx) in printerList" :key="idx">{{ item.name }}
        </el-radio>
        <span slot="footer" class="dialog-footer">

      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
      </el-dialog>
    </div>


  </div>
</template>
<script>

const electron = window.require('electron');

export default {
  data() {
    return {
      dialogVisible: false,
      printerList: [],
      printName: '',
      isSilent:false,
    }
  },
  mounted() {
    this.getP()
  },
  methods: {
    //获取打印机列表
    getP() {
      electron.ipcRenderer.send('allPrint');
      electron.ipcRenderer.on('printName', (event, data) => {
        this.printerList = data
      })
    },
    //打印
    print() {
      let obj = {};
      obj.deviceName =  localStorage.getItem('printName'); //打印机名称
      obj.html = `<div>这是一段测试打印的程序</div>` //需打印的数据
      // electron.ipcRenderer.send('do',localStorage.getItem('printName'),localStorage.getItem('printName'),localStorage.getItem('printName')&&localStorage.getItem('isChosedPrint')==='1')
      const flag=localStorage.getItem('printName')&&localStorage.getItem('isSilent')=='true'
      console.log(!!flag);
      electron.ipcRenderer.send('print-start', obj,!!flag)
    },
    //关闭弹窗
    handleClose() {
      this.dialogVisible = false
    },
    //选取确定
    handleConfirm() {
      //记录todo
      localStorage.setItem('printName', this.printName)
      localStorage.setItem('isSilent', this.isSilent)
      this.handleClose()
    }
  }
}
</script>
