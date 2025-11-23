function createPublicHandlers({ sendJson, dataService }) {
  function handleHealth(res, dbPath) {
    return sendJson(res, { status: 'ok', database: dbPath });
  }

  function handleDashboard(res) {
    return sendJson(res, dataService.getDashboardData());
  }

  function handleNews(res) {
    return sendJson(res, dataService.getNewsData());
  }

  function handleDocuments(res) {
    return sendJson(res, dataService.getDocumentData());
  }

  return {
    handleHealth,
    handleDashboard,
    handleNews,
    handleDocuments,
  };
}

module.exports = { createPublicHandlers };
