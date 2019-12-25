
export function createRouterTree(sourceRouter) { // 创建路由树列表
  if (!sourceRouter || sourceRouter.length === 0) {
    return []
  }
  let routerTree = []
  let parentId = 0
  sourceRouter.forEach((item, index) => {
    if (item.parentId === parentId) {
      let r = {}
      let p = JSON.parse(item.meta)
      r.id = item.id
      r.name = p.title
      r.checked = false
      ChildRouterTree(sourceRouter, r, item.id)
      routerTree.push(r)
    }
  })
  return routerTree
}

function ChildRouterTree(sourceRouter, parentRouter, parentId) {
  sourceRouter.forEach((item, index) => {
    if (item.parentId === parentId) {
      let r = {}
      let p = JSON.parse(item.meta)
      r.id = item.id
      r.name = p.title
      if (!parentRouter.children) {
        parentRouter.children = []
      }
      parentRouter.children.push(r)
      ChildRouterTree(sourceRouter, r, item.id)
    }
  })
  return parentRouter.children
}

