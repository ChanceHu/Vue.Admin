// 手机号验证
var phoneValidate = (rule, value, callback) => {
  const regFormat = /^[1][3578][0-9]{9}$/ // 正确手机号
  if (!value) {
    return callback(new Error('不能为空'))
  }
  if (!(regFormat.test(value))) {
    callback(new Error('请输入正确手机号'))
  } else {
    if (value < 18) {
      callback(new Error('必须大于18岁'))
    } else {
      callback()
    }
  }
}
// 数字验证
var numberValidate = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('不能为空'))
  }
  if (!Number.isInteger(value)) {
    callback(new Error('请输入数字值'))
  } else {
    if (value < 18) {
      callback(new Error('必须大于18岁'))
    } else if (value > 55) {
      callback(new Error('必须小于55岁'))
    } else {
      callback()
    }
  }
}
// text不能为空
var textValidate = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('不能为空'))
  } else {
    callback()
  }
}
// 邮箱
var emailValidate = (rule, value, callback) => {
  const mal = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
  if (!value) {
    return callback(new Error('不能为空'))
  }
  if (!(mal.test(value))) {
    callback(new Error('请输入正确邮箱'))
  } else {
    callback()
  }
}
// 开始时间
var startTimeValidate = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请选择开始日期'))
  } else {
    callback()
  }
}
// 开始时间
var endTimeValidate = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请选择结束日期'))
  } else {
    callback()
  }
}
// 时间
var timeValidate = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请选择日期'))
  } else {
    callback()
  }
}
// 多选框
var checkboxValidate = (rule, value, callback) => {
  if (value.length < 1) {
    return callback(new Error('请选择一个'))
  } else {
    callback()
  }
}
// 单选框
var radioValidate = (rule, value, callback) => {
  if (value.length < 1) {
    return callback(new Error('请选择一个'))
  } else {
    callback()
  }
}
// 下拉框
var selectValidate = (rule, value, callback) => {
  if (value.length < 1) {
    return callback(new Error('请选择一个'))
  } else {
    callback()
  }
}
// 上传图片
var imageUrlValidate = (rule, value, callback) => { 
  if (!value) {
    callback(new Error('请上传图片'))
  } else {
    callback()
  }
}
