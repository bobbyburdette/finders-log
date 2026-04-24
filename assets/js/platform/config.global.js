(function () {
  window.AppConfig = {
    appName: "The Finder's Log",
    environment: "prototype",
    apiBaseUrl: "",
    featureFlags: {
      remoteApi: false,
      billing: false,
      auth: false
    },
    storageKeys: {
      entries: {
        pipe: "briarroad_pipe_entries",
        cigar: "briarroad_cigar_entries",
        whiskey: "briarroad_whiskey_entries"
      },
      collection: "briarroad_collection",
      wantToTry: "briarroad_want_to_try",
      legacyPipeJournal: "pipe_journal_entries"
    }
  };
})();
