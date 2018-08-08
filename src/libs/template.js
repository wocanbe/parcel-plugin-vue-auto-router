<%=files.join('\n')%>
const defaultRouter = {render: h => h('router-view')}
function pubFilter (file, route) {
  const extendInfo = file(route.path)
  return extend(extendInfo, route)
}
const routes = <%=routerStr%>
export default routes
