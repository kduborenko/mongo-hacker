(function () {
    function Size(size) {
        this.tojson = function () {
            function wrap(value, start, end, name, multiplier) {
                if (value >= start && value < end) {
                    return (value / multiplier).toFixed(2) + name
                }
                return value;
            }

            size = wrap(size, 0, 2 * 1024, "b", 1);
            size = wrap(size, 2 * 1024, 2 * 1024 * 1024, "Kb", 1024);
            size = wrap(size, 2 * 1024 * 1024, 2 * 1024 * 1024 * 1024, "Mb", 1024 * 1024);
            size = wrap(size, 2 * 1024 * 1024 * 1024, Infinity, "Gb", 1024 * 1024 * 1024);

            return colorize(size, "blue", true);
        };
    }

    var super_db_stats = DB.prototype.stats;

    DB.prototype.stats = function (original) {
        var stats = super_db_stats.call(this);
        var db = this;
        if (!original) {
            ["avgObjSize", "dataSize", "storageSize", "indexSize", "fileSize"].forEach(function (f) {
                if (f in stats) {
                    stats[f] = new Size(stats[f]);
                }
            });

            if ("nsSizeMB" in stats) {
                stats.nsSize = new Size(stats.nsSizeMB * 1024 * 1024);
                delete stats.nsSizeMB;
            }

            stats.collections = [];
            this.getCollectionNames().forEach(function (c) {
                stats.collections.push(db[c].stats())
            });
        }
        return stats;
    };

    var super_coll_stats = DBCollection.prototype.stats;

    DBCollection.prototype.stats = function (original) {
        var stats = super_coll_stats.call(this);
        if (!original) {
            ["size", "avgObjSize", "storageSize", "lastExtentSize", "totalIndexSize"].forEach(function (f) {
                if (f in stats) {
                    stats[f] = new Size(stats[f]);
                }
            });
            for(var indexKey in stats.indexSizes) if (stats.indexSizes.hasOwnProperty(indexKey)) {
                stats.indexSizes[indexKey] = new Size(stats.indexSizes[indexKey])
            }
        }
        return stats;
    };
})();