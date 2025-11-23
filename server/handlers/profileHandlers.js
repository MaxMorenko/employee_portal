function createProfileHandlers({ db, parseBody, sendJson, sessionService }) {
  function handleGetProfile(req, res) {
    const session = sessionService.requireUser(req, res);
    if (!session) return;

    return sendJson(res, session.user);
  }

  function handleUpdateProfileStatus(req, res) {
    const session = sessionService.requireUser(req, res);
    if (!session) return;

    parseBody(req)
      .then((body) => {
        const { status = '' } = body;
        const cleanStatus = String(status).trim();
        if (!cleanStatus) {
          return sendJson(res, { message: 'Статус не може бути порожнім' }, 400);
        }

        db.prepare('UPDATE users SET status = ? WHERE id = ?').run(cleanStatus, session.user.id);

        const refreshed = sessionService.getSessionUser(session.token);
        return sendJson(res, refreshed || session.user);
      })
      .catch((error) => sendJson(res, { message: 'Не вдалося оновити статус', error: String(error) }, 400));
  }

  return {
    handleGetProfile,
    handleUpdateProfileStatus,
  };
}

module.exports = { createProfileHandlers };
