(function () {
  var memoryStore = {};

  function parseJSON(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function canUseLocalStorage() {
    try {
      return typeof window.localStorage !== "undefined";
    } catch (error) {
      return false;
    }
  }

  function read(key, fallback) {
    if (canUseLocalStorage()) {
      try {
        return parseJSON(window.localStorage.getItem(key), fallback);
      } catch (error) {
        if (Object.prototype.hasOwnProperty.call(memoryStore, key)) {
          return parseJSON(memoryStore[key], fallback);
        }
        return fallback;
      }
    }

    if (Object.prototype.hasOwnProperty.call(memoryStore, key)) {
      return parseJSON(memoryStore[key], fallback);
    }

    return fallback;
  }

  function write(key, value) {
    var serialized = JSON.stringify(value);

    if (canUseLocalStorage()) {
      try {
        window.localStorage.setItem(key, serialized);
        return;
      } catch (error) {
        memoryStore[key] = serialized;
        return;
      }
    }

    memoryStore[key] = serialized;
  }

  var keys = window.AppConfig.storageKeys;

  window.AppStorage = {
    entries: {
      load: function (category) {
        return read(keys.entries[category], []);
      },
      save: function (category, items) {
        write(keys.entries[category], items);
      },
      loadAll: function () {
        return {
          pipe: read(keys.entries.pipe, []),
          cigar: read(keys.entries.cigar, []),
          whiskey: read(keys.entries.whiskey, [])
        };
      }
    },
    collection: {
      load: function () {
        return read(keys.collection, {});
      },
      save: function (value) {
        write(keys.collection, value);
      }
    },
    wantToTry: {
      load: function () {
        return read(keys.wantToTry, []);
      },
      save: function (value) {
        write(keys.wantToTry, value);
      }
    },
    legacy: {
      loadPipeJournal: function () {
        return read(keys.legacyPipeJournal, []);
      }
    }
  };
})();
