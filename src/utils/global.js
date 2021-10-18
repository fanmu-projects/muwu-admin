

// 回显数据字典
export function selectDictLabel(datas, value) {
  var actions = []
  if (datas == null) {
    return actions
  }
  Object.keys(datas).some(key => {
    if (datas[key].value == value.toString()) {
      actions.push(datas[key].label)
      return true;
    }
  })
  return actions.join("")
}
