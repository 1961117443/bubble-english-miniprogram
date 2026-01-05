// api/report-api.js
// ✅ 仅占位：学习上报/统计等由后端实现

export const ReportApi = {
  /**
   * 提交一次学习报告（LearnReport）
   * @param {any} report
   */
  async submit(report) {
    console.log('[API TODO] ReportApi.submit', report)
    throw new Error('TODO backend: ReportApi.submit')
  },

  /**
   * 获取孩子学习统计（按 day/week/month 聚合）
   * @param {{childId:string,period:'day'|'week'|'month',date?:string}} query
   */
  async getChildStats(query) {
    console.log('[API TODO] ReportApi.getChildStats', query)
    throw new Error('TODO backend: ReportApi.getChildStats')
  }
}
